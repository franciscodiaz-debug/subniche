-- CreateTable
CREATE TABLE "attributes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" VARCHAR(15) NOT NULL,
    "name" VARCHAR(45) NOT NULL,
    "code" VARCHAR(45) NOT NULL,
    "allow_values" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (unique on type + code)
CREATE UNIQUE INDEX "attributes_type_code_key" ON "attributes"("type", "code");

-- Seed
INSERT INTO "attributes" ("type", "name", "code", "allow_values", "order") VALUES
('condition', 'New', 'new', false, 0),
('condition', 'Used - As New', 'used-as-new', false, 1),
('condition', 'Used', 'used', false, 2),
('condition', 'Used - As Is', 'used-as-is', false, 3),
('payment', 'Cash', 'cash', false, 0),
('payment', 'PayPal - Friends and Family', 'paypal-friends-and-family', false, 1),
('payment', 'PayPal - Goods and Services', 'paypal-goods-and-services', false, 2),
('payment', 'Venmo', 'venmo', false, 3),
('payment', 'Cryptocurrency', 'cryptocurrency', false, 4),
('payment', 'Other', 'other', false, 5),
('logistics', 'Local Pickup', 'local-pickup', true, 0),
('logistics', 'Shipping', 'shipping', true, 1);

ALTER TABLE "attributes" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attributes: anon read-only"
  ON "attributes"
  FOR SELECT
  TO anon
  USING (true);
