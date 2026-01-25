
-- DocumentType
INSERT INTO public."DocumentType" 
(id,code,"name","createdAt","updatedAt","isActive","createdBy","updatedBy") 
select *
from (
	 select '4e0b3801-11b7-4fe2-9426-53e71139f63b','DNI','Documento nacional de identifdad',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,true,NULL,null
	 union all
	 select 'eedfd792-f935-497d-a351-ee3c0ddd01d3','RUC','Ruc',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,true,NULL,null
	 union all
	 select '248d9b93-47fb-4960-810a-3e3adcc18eb3','CE','Carnet de extranjeria',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,true,NULL,NULL
	 union all
	 select '00b23aff-6157-44f4-bb58-ed9898e455cf','PASAPORTE','Pasaporte',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,true,NULL,NULL
) as t
ON CONFLICT (id) DO NOTHING;

-- ReceiptType
INSERT INTO public."ReceiptType"
(id, code, "name", description, "isElectronic", "isActive", "createdAt", "updatedAt")
SELECT *
FROM (
    SELECT 'ae06b3af-3ed4-4d4f-a41f-2d7f942ca2c6', 'BL', 'Boleta de venta', 'Boleta de venta', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    UNION ALL
    SELECT 'a7c0b2b4-7cc1-40cf-9cd6-73b0b5ce6556', 'FA', 'Factura', 'Factura', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    UNION ALL
    SELECT '221c1d15-04c9-4159-9ed1-8c6b2ad18e47', 'NF', 'Documento no fiscal', 'Documento no fiscal', true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) t
ON CONFLICT (id) DO NOTHING;


-- Tax
INSERT INTO public."Tax"
(id, code, "name", value, "type", description, "isActive", "createdAt", "updatedAt")
SELECT *
FROM (
    SELECT 'd619aae6-4032-44cf-bc68-81500de37252', 'IGV', 'Impuesto a la renta', 18, 'percentage'::"TaxType",
           'Impuesto a la renta', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
) t
ON CONFLICT (id) DO NOTHING;


-- Currency
INSERT INTO public."Currency"
(id, "name", code, symbol, "isActive",
 "createdAt", "updatedAt", "createdBy", "updatedBy")
SELECT *
FROM (
    SELECT '221c1d15-04c9-4159-9ed1-8c6b2ad18e47', 'Nuevos soles', 'PEN', 'S/.', true,
           CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL
) t
ON CONFLICT (id) DO NOTHING;


--frecuency
INSERT INTO public."PaymentFrequency"
(id, "name", description, "intervalDays", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy")
SELECT *
FROM (
    SELECT '221c1d15-04c9-4159-9ed1-8c6b2ad18e47', 'Mensual', 'Cada 30 días', 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL
) t
ON CONFLICT (id) DO NOTHING;

--servicios
INSERT INTO public."Service"
(id, "name", description, "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy")
SELECT *
FROM (
    SELECT 'a8237c4d-ae4e-4fc1-b1dd-6cd04c3bc8d9', 'Suscripciones', 'Servicios de accesos a aplicaciones'
, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL
) t
ON CONFLICT (id) DO NOTHING;


--promociones
INSERT INTO public."Promotion"
(id,code,"name",description,"discountType","discountValue","durationUnit","durationValue","isSingleUse","startDate","endDate","maxUsages","currentUsages","isActive","createdAt","updatedAt","createdBy","updatedBy")
SELECT *
FROM (
    select 'b9b8ca8b-8a3e-4069-93b9-9041cef1921c','BETA','PUBLIC PREVIEW','','FIXED'::public."DiscountType",0.0,'DAY'::public."DurationUnit",60,false,'2026-01-21 03:17:25.152'::timestamp without time zone,'2026-04-21 03:17:25.152'::timestamp without time zone,1,0,true,'2026-01-21 03:17:25.152'::timestamp without time zone,'2026-01-21 03:17:25.152'::timestamp without time zone,NULL,NULL
) t
ON CONFLICT (id) DO NOTHING;

--Plan
INSERT INTO public."Plan"
(id,code,"name",description,price,"maxUsers","isActive","serviceId","frequencyId","currencyId","createdAt","updatedAt","isDeleted","isEnabled","createdBy","updatedBy",shortdescription)
SELECT *
FROM (
    select 'a4382899-8829-4dc1-8826-571fa81202ba','PL-00002','STANDARD',NULL,0.0,0,true,'a8237c4d-ae4e-4fc1-b1dd-6cd04c3bc8d9','221c1d15-04c9-4159-9ed1-8c6b2ad18e47','221c1d15-04c9-4159-9ed1-8c6b2ad18e47','2026-01-21 03:17:25.152'::timestamp without time zone,'2026-01-21 03:17:25.152'::timestamp without time zone,false,false,NULL,NULL,'Muy pronto tendremos las especificaciones'
    UNION ALL
    SELECT '8efd8b70-7599-4a51-a897-74a42aaa3e09','PL-00003','PLUS',NULL,0.0,0,true,'a8237c4d-ae4e-4fc1-b1dd-6cd04c3bc8d9','221c1d15-04c9-4159-9ed1-8c6b2ad18e47','221c1d15-04c9-4159-9ed1-8c6b2ad18e47','2026-01-21 03:17:25.152'::timestamp without time zone,'2026-01-21 03:17:25.152'::timestamp without time zone,false,false,NULL,NULL,'Estamos trabjando en ofrecer cada vez mejores servicios'
    UNION ALL
    SELECT 'e899d6f6-74e2-4bc7-a15d-5b7379af207d','STARTER','STARTER','Módulo de registro de pedidos, ventas y extraccón de reporte.',34.0,2,true,'a8237c4d-ae4e-4fc1-b1dd-6cd04c3bc8d9','221c1d15-04c9-4159-9ed1-8c6b2ad18e47','221c1d15-04c9-4159-9ed1-8c6b2ad18e47','2026-01-21 03:17:25.152'::timestamp without time zone,'2026-01-21 03:17:25.152'::timestamp without time zone,false,true,NULL,NULL,'Licencia para los módulos principales.'
) t
ON CONFLICT (id) DO NOTHING;


--Tarifas
INSERT INTO public."Tariff"
(id,"planId","promotionId","totalCost",description,"createdAt","updatedAt","isActive")
SELECT *
FROM (
    select '97b54361-03da-492d-ad39-db92b8a4abc6','e899d6f6-74e2-4bc7-a15d-5b7379af207d','b9b8ca8b-8a3e-4069-93b9-9041cef1921c',0.0,'','2026-01-21 03:17:25.152'::timestamp without time zone,'2026-01-21 03:17:25.152'::timestamp without time zone,true
    union all
    select '5fe3e6d0-4e42-4fd8-9940-107821536760','a4382899-8829-4dc1-8826-571fa81202ba',NULL,0.0,NULL,'2026-01-21 03:17:25.152'::timestamp without time zone,'2026-01-21 03:17:25.152'::timestamp without time zone,true
    union all 
    select 'f5ab4fad-b726-4bfd-9e46-d4d15e05341c','8efd8b70-7599-4a51-a897-74a42aaa3e09',NULL,0.0,NULL,'2026-01-21 03:17:25.152'::timestamp without time zone,'2026-01-21 03:17:25.152'::timestamp without time zone,true
) t
ON CONFLICT (id) DO NOTHING;