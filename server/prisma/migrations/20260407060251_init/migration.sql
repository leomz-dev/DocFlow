-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "website" TEXT,
    "tagline" TEXT,
    "legalRep" TEXT,
    "legalRepId" TEXT,
    "logoPath" TEXT,
    "signPath" TEXT,
    "bankName" TEXT,
    "bankAccountType" TEXT,
    "bankAccountNum" TEXT,
    "bankHolder" TEXT,
    "ivaRate" DOUBLE PRECISION NOT NULL DEFAULT 19,
    "retencionRate" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
    "regimenTributario" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "cuentaCobro" TEXT NOT NULL DEFAULT 'default',
    "cotizacion" TEXT NOT NULL DEFAULT 'default',
    "contrato" TEXT NOT NULL DEFAULT 'default',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counter" (
    "id" TEXT NOT NULL,
    "cuentaCobro" INTEGER NOT NULL DEFAULT 0,
    "cotizacion" INTEGER NOT NULL DEFAULT 0,
    "contrato" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "Company"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Template_userId_key" ON "Template"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Counter_userId_key" ON "Counter"("userId");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counter" ADD CONSTRAINT "Counter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
