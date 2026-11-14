-- =====================================================================
--  PROPUESTA DE BASE DE DATOS — Albergue Municipal de Mascotas Mixco
--  Motor: PostgreSQL (probado para Supabase, plan gratuito)
--
--  Las tablas son las mismas del Panel de gestión (admin.html), así que
--  los datos se pueden migrar con: npm run respaldo-a-csv -- respaldo.json
--
--  ⚠ Ejecutar SOLO cuando exista un acuerdo formal de manejo de datos
--    personales con la Municipalidad (contiene DPI, teléfonos, direcciones).
--
--  Cómo usarlo en Supabase:  SQL Editor → New query → pegar todo → Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Catálogos (valores permitidos)
-- ---------------------------------------------------------------------
create type especie_t         as enum ('perro', 'gato');
create type sexo_t            as enum ('macho', 'hembra');
create type tamano_t          as enum ('pequeño', 'mediano', 'grande');
create type estado_animal_t   as enum ('en-tratamiento', 'disponible', 'en-proceso', 'adoptado', 'transferido', 'fallecido');
create type procedencia_t     as enum ('calle', 'entregado', 'reporte', 'maltrato', 'nacido', 'otro');
create type tipo_proc_t       as enum ('vacuna', 'desparasitacion', 'esterilizacion', 'consulta', 'tratamiento', 'cirugia', 'estetica', 'otro');
create type estado_solicitud_t as enum ('pendiente', 'en-revision', 'aprobada', 'rechazada');
create type vivienda_t        as enum ('casa-patio', 'casa', 'apartamento');
create type tipo_seguim_t     as enum ('llamada', 'visita', 'mensaje', 'foto');
create type resultado_t       as enum ('bien', 'observaciones', 'preocupante');
create type rol_t             as enum ('admin', 'personal', 'veterinario');

-- ---------------------------------------------------------------------
-- 2. Personal con acceso (se enlaza con los usuarios de Supabase Auth)
-- ---------------------------------------------------------------------
create table personal (
  id         uuid primary key references auth.users (id) on delete cascade,
  nombre     text not null,
  rol        rol_t not null default 'personal',
  activo     boolean not null default true,
  creado     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. Tablas principales (mismos campos que el Panel de gestión)
-- ---------------------------------------------------------------------
create table animales (
  id                 text primary key,                 -- legible: 'canela' (se usa en el enlace público)
  nombre             text not null,
  especie            especie_t not null,
  sexo               sexo_t,
  edad_aprox         text,
  tamano             tamano_t,
  fecha_ingreso      date not null default current_date,
  procedencia        procedencia_t,
  estado             estado_animal_t not null default 'en-tratamiento',
  color              text default '#E3A35A',
  manchas            text,
  publicar           boolean not null default false,
  foto               text,
  personalidad       text[] not null default '{}',
  historia           text,                              -- público
  ideal_para         text,                              -- público
  final_feliz_texto  text,                              -- público (solo si fue adoptado)
  notas              text,                              -- PRIVADO
  creado             timestamptz not null default now(),
  actualizado        timestamptz not null default now()
);

create table procedimientos (
  id             text primary key default gen_random_uuid()::text,
  animal_id      text not null references animales (id) on delete restrict,
  fecha          date not null,
  tipo           tipo_proc_t not null,
  detalle        text,
  responsable    text,
  costo          numeric(10, 2) check (costo >= 0),
  proxima_fecha  date,
  notas          text,
  creado         timestamptz not null default now(),
  actualizado    timestamptz not null default now()
);

create table solicitudes (
  id           text primary key default gen_random_uuid()::text,
  fecha        date not null default current_date,
  nombre       text not null,
  dpi          text,
  telefono     text,
  correo       text,
  direccion    text,
  animal_id    text references animales (id) on delete set null,
  vivienda     vivienda_t,
  respuestas   text,
  estado       estado_solicitud_t not null default 'pendiente',
  evaluador    text,
  motivo       text,                 -- motivo de aprobación o rechazo
  creado       timestamptz not null default now(),
  actualizado  timestamptz not null default now()
);

create table adopciones (
  id            text primary key default gen_random_uuid()::text,
  animal_id     text not null references animales (id) on delete restrict,
  solicitud_id  text not null references solicitudes (id) on delete restrict,
  fecha         date not null default current_date,
  folio         text unique,
  notas         text,
  creado        timestamptz not null default now(),
  actualizado   timestamptz not null default now()
);

create table seguimientos (
  id           text primary key default gen_random_uuid()::text,
  adopcion_id  text not null references adopciones (id) on delete cascade,
  fecha        date not null default current_date,
  tipo         tipo_seguim_t,
  resultado    resultado_t,
  notas        text,
  creado       timestamptz not null default now(),
  actualizado  timestamptz not null default now()
);

-- Mensajes que llegan por la API de WhatsApp (ver docs/whatsapp)
create table mensajes_whatsapp (
  id             text primary key,                 -- id del mensaje que envía Meta (evita duplicados)
  wa_id          text not null,                    -- número de quien escribe, ej. 50246302368
  nombre_perfil  text,
  texto          text,
  recibido       timestamptz not null default now(),
  procesado      boolean not null default false,
  solicitud_id   text references solicitudes (id) on delete set null
);

-- Índices para las consultas del tablero
create index on procedimientos (animal_id, tipo, fecha desc);
create index on procedimientos (proxima_fecha) where proxima_fecha is not null;
create index on solicitudes (estado);
create index on adopciones (fecha);
create index on seguimientos (adopcion_id);
create index on mensajes_whatsapp (procesado, recibido);

-- ---------------------------------------------------------------------
-- 4. Reglas automáticas
-- ---------------------------------------------------------------------
-- Fecha de "actualizado" al editar
create or replace function tocar_actualizado() returns trigger language plpgsql as $$
begin new.actualizado := now(); return new; end $$;

create trigger t_animales      before update on animales      for each row execute function tocar_actualizado();
create trigger t_procedimientos before update on procedimientos for each row execute function tocar_actualizado();
create trigger t_solicitudes   before update on solicitudes   for each row execute function tocar_actualizado();
create trigger t_adopciones    before update on adopciones    for each row execute function tocar_actualizado();
create trigger t_seguimientos  before update on seguimientos  for each row execute function tocar_actualizado();

-- Igual que en el panel: al registrar una adopción, el animal pasa a
-- "adoptado" y la solicitud a "aprobada".
create or replace function al_adoptar() returns trigger language plpgsql as $$
begin
  update animales    set estado = 'adoptado' where id = new.animal_id;
  update solicitudes set estado = 'aprobada' where id = new.solicitud_id;
  return new;
end $$;
create trigger t_al_adoptar after insert on adopciones for each row execute function al_adoptar();

-- ---------------------------------------------------------------------
-- 5. Vistas útiles
-- ---------------------------------------------------------------------
-- Lista PÚBLICA para la página web: mismos nombres que animales.json,
-- sin notas, procedencia, fechas internas ni datos de personas.
create or replace view animales_publicos as
select
  a.id, a.nombre, a.especie, a.sexo, a.edad_aprox as edad, a.tamano, a.estado,
  a.color, a.manchas, coalesce(a.foto, '') as foto, a.personalidad,
  json_build_object(
    'vacunas',       exists (select 1 from procedimientos p where p.animal_id = a.id and p.tipo = 'vacuna'),
    'desparasitado', exists (select 1 from procedimientos p where p.animal_id = a.id and p.tipo = 'desparasitacion'),
    'esterilizado',  exists (select 1 from procedimientos p where p.animal_id = a.id and p.tipo = 'esterilizacion')
  ) as salud,
  coalesce(a.historia, '') as historia,
  coalesce(a.ideal_para, '') as "idealPara",
  case when a.estado = 'adoptado' and a.final_feliz_texto is not null then
    json_build_object('fecha', (select max(fecha) from adopciones d where d.animal_id = a.id), 'texto', a.final_feliz_texto, 'foto', '')
  end as "finalFeliz"
from animales a
where a.publicar and a.estado in ('disponible', 'en-proceso', 'adoptado');

-- Vacunas y controles próximos (animales que siguen en el albergue)
create or replace view proximos_procedimientos as
select distinct on (p.animal_id, p.tipo)
  p.animal_id, a.nombre, p.tipo, p.detalle, p.proxima_fecha,
  p.proxima_fecha < current_date as vencido
from procedimientos p
join animales a on a.id = p.animal_id
where a.estado in ('en-tratamiento', 'disponible', 'en-proceso')
order by p.animal_id, p.tipo, p.fecha desc;

-- Seguimientos pendientes (1 mes y 6 meses después de la adopción)
create or replace view seguimientos_pendientes as
select d.id as adopcion_id, a.nombre as animal, s.nombre as adoptante, s.telefono, d.fecha,
       case when d.fecha + 180 <= current_date and n.hechos < 2 then '6 meses'
            when d.fecha + 30  <= current_date and n.hechos < 1 then '1 mes' end as hito
from adopciones d
join animales a on a.id = d.animal_id
join solicitudes s on s.id = d.solicitud_id
cross join lateral (select count(*) as hechos from seguimientos g where g.adopcion_id = d.id) n
where (d.fecha + 30 <= current_date and n.hechos < 1) or (d.fecha + 180 <= current_date and n.hechos < 2);

-- Informe mensual (para la Municipalidad)
create or replace view informe_mensual as
select to_char(m, 'YYYY-MM') as mes,
  (select count(*) from animales     where date_trunc('month', fecha_ingreso) = m) as ingresos,
  (select count(*) from adopciones   where date_trunc('month', fecha) = m)         as adopciones,
  (select count(*) from procedimientos where tipo = 'esterilizacion' and date_trunc('month', fecha) = m) as esterilizaciones,
  (select count(*) from solicitudes  where date_trunc('month', fecha) = m)         as solicitudes
from generate_series(date_trunc('month', current_date) - interval '11 months', date_trunc('month', current_date), interval '1 month') m;

-- ---------------------------------------------------------------------
-- 6. Seguridad (Row Level Security)
--    · Visitantes anónimos: SOLO la vista animales_publicos.
--    · Personal activo: leer y editar todo.
--    · Solo administradores: eliminar.
-- ---------------------------------------------------------------------
create or replace function es_personal() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from personal where id = auth.uid() and activo)
$$;
create or replace function es_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from personal where id = auth.uid() and activo and rol = 'admin')
$$;

do $$
declare t text;
begin
  foreach t in array array['animales', 'procedimientos', 'solicitudes', 'adopciones', 'seguimientos', 'mensajes_whatsapp'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "personal lee"     on %I for select to authenticated using (es_personal())', t);
    execute format('create policy "personal agrega"  on %I for insert to authenticated with check (es_personal())', t);
    execute format('create policy "personal edita"   on %I for update to authenticated using (es_personal()) with check (es_personal())', t);
    execute format('create policy "admin elimina"    on %I for delete to authenticated using (es_admin())', t);
  end loop;
end $$;

alter table personal enable row level security;
create policy "ver mi perfil"      on personal for select to authenticated using (id = auth.uid() or es_admin());
create policy "admin administra"   on personal for all    to authenticated using (es_admin()) with check (es_admin());

-- Las vistas se ejecutan con permisos de su dueño: el público solo ve
-- las columnas seguras de animales_publicos, nunca las tablas.
revoke all on all tables in schema public from anon;
grant select on animales_publicos to anon;
revoke select on proximos_procedimientos, seguimientos_pendientes, informe_mensual from anon;

-- ---------------------------------------------------------------------
-- 7. Primer administrador
--    1) Authentication → Users → Add user (correo y contraseña del encargado)
--    2) Copiar su "User UID" y ejecutar:
-- insert into personal (id, nombre, rol) values ('PEGAR-UID-AQUI', 'Nombre del encargado', 'admin');
-- ---------------------------------------------------------------------
