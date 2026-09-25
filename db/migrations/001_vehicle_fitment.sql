-- Vehicle fitment: makes → models → generations (chassis codes) → products → parts (per-side SKUs)
-- Format: dbmate-style up/down sections. See .claude/skills/ymm-schema-designer.

-- migrate:up

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE makes (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL UNIQUE,
  slug       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE models (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  make_id    bigint NOT NULL REFERENCES makes (id) ON DELETE RESTRICT,
  name       text NOT NULL,
  slug       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (make_id, slug)
);
CREATE INDEX idx_models_make_id_name ON models (make_id, name);

-- The unit a customer selects ("Harrier (XU60)"). Slug = current src/data/vehicles.ts id.
CREATE TABLE vehicle_generations (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  model_id   bigint NOT NULL REFERENCES models (id) ON DELETE RESTRICT,
  name       text NOT NULL,
  slug       text NOT NULL UNIQUE,
  year_from  smallint NOT NULL,
  year_to    smallint, -- NULL = still in production
  body_type  text,
  popular    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (year_from BETWEEN 1950 AND 2100),
  CHECK (year_to IS NULL OR year_to BETWEEN year_from AND 2100)
);
CREATE INDEX idx_vehicle_generations_model_years ON vehicle_generations (model_id, year_from, year_to);

CREATE TABLE chassis_codes (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  generation_id bigint NOT NULL REFERENCES vehicle_generations (id) ON DELETE CASCADE,
  code          text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (generation_id, code)
);
CREATE INDEX idx_chassis_codes_code ON chassis_codes (upper(code));
CREATE INDEX idx_chassis_codes_code_trgm ON chassis_codes USING gin (upper(code) gin_trgm_ops);

CREATE TABLE engines (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code            text NOT NULL UNIQUE,
  displacement_cc integer CHECK (displacement_cc > 0),
  fuel            text CHECK (fuel IN ('petrol', 'diesel', 'hybrid', 'electric', 'lpg')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE generation_engines (
  generation_id bigint NOT NULL REFERENCES vehicle_generations (id) ON DELETE CASCADE,
  engine_id     bigint NOT NULL REFERENCES engines (id) ON DELETE CASCADE,
  PRIMARY KEY (generation_id, engine_id)
);
CREATE INDEX idx_generation_engines_engine_id ON generation_engines (engine_id);

-- One listing/page on the site. LH/RH variants live in `parts`.
CREATE TABLE products (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug           text NOT NULL UNIQUE,
  legacy_id      text UNIQUE, -- id from src/data/products.ts (carts in localStorage reference it)
  title          text NOT NULL,
  category       text NOT NULL,
  description    text,
  image_path     text,
  pair_price_kes integer CHECK (pair_price_kes >= 0), -- discounted LH+RH price, if offered
  featured       boolean NOT NULL DEFAULT false,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_category ON products (category) WHERE is_active;
CREATE INDEX idx_products_title_trgm ON products USING gin (title gin_trgm_ops);

-- Sellable SKU. `erpnext_item_code` links to ERPNext; it becomes 1:1 once ERPNext
-- holds separate LH/RH items for every product.
CREATE TABLE parts (
  id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id          bigint NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  sku                 text NOT NULL UNIQUE,
  erpnext_item_code   text,
  side                text NOT NULL CHECK (side IN ('LH', 'RH', 'pair', 'universal')),
  unit                text NOT NULL DEFAULT 'Pc',
  price_kes           integer NOT NULL CHECK (price_kes >= 0),
  stock_qty           integer NOT NULL DEFAULT 0,
  is_active           boolean NOT NULL DEFAULT true,
  erpnext_modified_at timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, side)
);
CREATE INDEX idx_parts_erpnext_item_code ON parts (erpnext_item_code);

-- OEM numbers and cross-references, searchable with or without dashes/spaces.
CREATE TABLE part_numbers (
  id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id        bigint NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  number            text NOT NULL,
  number_normalized text GENERATED ALWAYS AS
                      (upper(regexp_replace(number, '[^A-Za-z0-9]', '', 'g'))) STORED,
  kind              text NOT NULL CHECK (kind IN ('oem', 'manufacturer', 'aftermarket', 'supplier')),
  brand             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, number, kind)
);
CREATE INDEX idx_part_numbers_product_id ON part_numbers (product_id);
CREATE INDEX idx_part_numbers_normalized ON part_numbers (number_normalized);
CREATE INDEX idx_part_numbers_normalized_trgm ON part_numbers USING gin (number_normalized gin_trgm_ops);

CREATE TABLE product_fitments (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id    bigint NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  generation_id bigint NOT NULL REFERENCES vehicle_generations (id) ON DELETE RESTRICT,
  year_from     smallint, -- NULL = inherit generation years
  year_to       smallint,
  engine_id     bigint REFERENCES engines (id) ON DELETE RESTRICT,
  position      text NOT NULL DEFAULT 'any' CHECK (position IN ('front', 'rear', 'any')),
  notes         text,
  verified_by   text,
  verified_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (year_from IS NULL OR year_to IS NULL OR year_from <= year_to)
);
CREATE UNIQUE INDEX idx_product_fitments_unique
  ON product_fitments (product_id, generation_id, position,
                       coalesce(year_from, 0), coalesce(year_to, 0), coalesce(engine_id, 0));
CREATE INDEX idx_product_fitments_generation_product ON product_fitments (generation_id, product_id);
CREATE INDEX idx_product_fitments_engine_id ON product_fitments (engine_id) WHERE engine_id IS NOT NULL;

CREATE TRIGGER trg_makes_updated_at BEFORE UPDATE ON makes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_vehicle_generations_updated_at BEFORE UPDATE ON vehicle_generations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_engines_updated_at BEFORE UPDATE ON engines FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_parts_updated_at BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_product_fitments_updated_at BEFORE UPDATE ON product_fitments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- migrate:down

DROP TABLE IF EXISTS product_fitments;
DROP TABLE IF EXISTS part_numbers;
DROP TABLE IF EXISTS parts;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS generation_engines;
DROP TABLE IF EXISTS engines;
DROP TABLE IF EXISTS chassis_codes;
DROP TABLE IF EXISTS vehicle_generations;
DROP TABLE IF EXISTS models;
DROP TABLE IF EXISTS makes;
DROP FUNCTION IF EXISTS set_updated_at();
