import { Request, Response } from "express";
import { currencyService } from "./currency.service";
import { createCurrencySchema, updateCurrencySchema } from "./currency.validation";
import swaggerJSDoc from "swagger-jsdoc";
import { errorResponse, successResponse } from "@/utils/response";


/**
* @swagger
* /currencies:
*   post:
*     summary: Crear nueva moneda
*     tags: [Currency]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*               code:
*                 type: string
*               symbol:
*                 type: string
*     responses:
*       201:
*         description: Moneda creada correctamente
*       400:
*         description: Error al crear la moneda
*/



export const createCurrency = async (req: Request, res: Response) => {
  try {
    const data = createCurrencySchema.parse(req.body);
    const result = await currencyService.create(data);
    return successResponse(res, result, 'Moneda creada correctamente');
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al crear moneda', 500, errorMessage);
  }
};


/**
* @swagger
* /currencies:
*   get:
*     summary: Obtener todas las monedas
*     tags: [Currency]
*     responses:
*       200:
*         description: Lista de monedas obtenidas correctamente
* 
*/

export const getCurrencies = async (_: Request, res: Response) => {
  try {
  const result = await currencyService.findAll();
  return successResponse(res, result, 'Monedas listadas correctamente');
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(res, 'Error al obtener modenas', 500, errorMessage);
  }
};


/**
* @swagger
* /currencies/{id}:
*   get:
*     summary: Obtener una moneda por ID
*     tags: [Currency]
*     parameters:
*       - in: get
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       200:
*         description: Moneda obtenida correctamente
*       404:
*         description: Moneda no encontrada
*/

export const getCurrencyById = async (req: Request, res: Response) => {
  const result = await currencyService.findById(req.params.id);
  if (!result) 
    return res.status(404).json({ error: "Moneda no encontrada" });
  res.json(result);
};



/**
* @swagger
* /currencies/{id}:
*   put:
*     summary: Actualizar moneda por Id
*     tags: [Currency]
*     parameters:
*       - in: put
*         name: id
*         required: true
*         schema:
*          type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*               code:
*                 type: string
*               symbol:
*                 type: string
*     responses:
*       201:
*         description: Moneda actualizada correctamente
*       400:
*         description: Error al actualizar la moneda
*/


export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const data = updateCurrencySchema.parse(req.body);
    const result = await currencyService.update(req.params.id, data);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};


/**
* @swagger
* /currencies/{id}:
*   delete:
*     summary: Eliminar una moneda por ID
*     tags: [Currency]
*     parameters:
*       - in: get
*         name: id
*         required: true
*         schema:
*           type: string
*     responses:
*       204:
*         description: Moneda eliminada correctamente
*       400:
*         description: Moneda no encontrada o error al eliminar
*/


export const deleteCurrency = async (req: Request, res: Response) => {
  try {
    await currencyService.remove(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
