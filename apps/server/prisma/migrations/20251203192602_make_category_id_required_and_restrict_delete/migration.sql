-- Step 1: Check if categories table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
    -- Create categories table if it doesn't exist
    CREATE TABLE "categories" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "description" TEXT,
      "icon" TEXT,
      "sort_order" INTEGER NOT NULL DEFAULT 0,
      "is_active" BOOLEAN NOT NULL DEFAULT true,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
    );
    
    CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
    CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
    CREATE INDEX "categories_slug_idx" ON "categories"("slug");
    CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");
  END IF;
END $$;

-- Step 2: Update all services without categoryId to have a default category
-- First, ensure there's at least one category (if not, create a default one)
DO $$
DECLARE
  default_category_id TEXT;
  services_without_category INTEGER;
BEGIN
  -- Get or create a default category
  SELECT id INTO default_category_id FROM categories WHERE is_active = true LIMIT 1;
  
  IF default_category_id IS NULL THEN
    -- Create a default category if none exists
    INSERT INTO categories (id, name, slug, description, is_active, sort_order, created_at, updated_at)
    VALUES (
      gen_random_uuid()::TEXT,
      'Other',
      'other',
      'Default category for services without category',
      true,
      999,
      NOW(),
      NOW()
    )
    RETURNING id INTO default_category_id;
  END IF;
  
  -- Count services without category (only if services table exists)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
    SELECT COUNT(*) INTO services_without_category
    FROM services
    WHERE category_id IS NULL;
    
    -- Update services without category
    IF services_without_category > 0 THEN
      UPDATE services
      SET category_id = default_category_id
      WHERE category_id IS NULL;
      
      RAISE NOTICE 'Updated % services to use default category', services_without_category;
    END IF;
  END IF;
END $$;

-- Step 2: Drop the existing foreign key constraint
ALTER TABLE "services" DROP CONSTRAINT IF EXISTS "services_category_id_fkey";

-- Step 3: Make category_id NOT NULL
ALTER TABLE "services" ALTER COLUMN "category_id" SET NOT NULL;

-- Step 4: Recreate the foreign key with RESTRICT on delete
ALTER TABLE "services" 
  ADD CONSTRAINT "services_category_id_fkey" 
  FOREIGN KEY ("category_id") 
  REFERENCES "categories"("id") 
  ON DELETE RESTRICT 
  ON UPDATE CASCADE;

