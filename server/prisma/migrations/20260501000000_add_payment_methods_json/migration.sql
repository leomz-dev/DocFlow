-- Step 1: Add the new paymentMethods JSON column with default empty array
ALTER TABLE "Company" ADD COLUMN "paymentMethods" JSONB NOT NULL DEFAULT '[]';

-- Step 2: Migrate existing bank data into the new JSON column
UPDATE "Company"
SET "paymentMethods" = jsonb_build_array(
  jsonb_build_object(
    'bankName',        COALESCE("bankName", ''),
    'bankAccountType', COALESCE("bankAccountType", ''),
    'bankAccountNum',  COALESCE("bankAccountNum", ''),
    'bankHolder',      COALESCE("bankHolder", '')
  )
)
WHERE "bankName" IS NOT NULL AND "bankName" != '';

-- Step 3: Drop the old columns
ALTER TABLE "Company" DROP COLUMN "bankName";
ALTER TABLE "Company" DROP COLUMN "bankAccountType";
ALTER TABLE "Company" DROP COLUMN "bankAccountNum";
ALTER TABLE "Company" DROP COLUMN "bankHolder";
