const debug = require('debug')('app:routes:api:pet');
const debugError = require('debug')('app:error');
const express = require('express');

const {
  newId,
  findAllPets,
  findPetById,
  insertOnePet,
  updateOnePet,
  deleteOnePet,
} = require('../../database');

const asyncCatch = require('../../middleware/async-catch');
const validId = require('../../middleware/valid-id');
const validBody = require('../../middleware/valid-body');

const Joi = require('joi');
const newPetSchema = Joi.object({
  species: Joi.string().trim().min(1).required(),
  name: Joi.string().trim().min(1).required(),
  age: Joi.number().integer().min(1).required(),
  gender: Joi.string().trim().length(1).required(),
});
const updatePetSchema = Joi.object({
  species: Joi.string().trim().min(1),
  name: Joi.string().trim().min(1),
  age: Joi.number().integer().min(1),
  gender: Joi.string().trim().length(1),
});

// const petsArray = [
//   { _id: '1', name: 'Fido', createdDate: new Date() },
//   { _id: '2', name: 'Watson', createdDate: new Date() },
//   { _id: '3', name: 'Loki', createdDate: new Date() },
// ];

// create a router
const router = express.Router();

// define routes
router.get(
  '/list',
  asyncCatch(async (req, res, next) => {
    debug('get all pets');
    const pets = await findAllPets();
    res.json(pets);
  })
);
router.get(
  '/:petId',
  validId('petId'),
  asyncCatch(async (req, res, next) => {
    const petId = req.petId;
    debug(`get pet ${petId}`);

    const pet = await findPetById(petId);
    if (!pet) {
      res.status(404).json({ error: `Pet ${petId} not found.` });
    } else {
      res.json(pet);
    }
  })
);
router.put(
  '/new',
  validBody(newPetSchema),
  asyncCatch(async (req, res, next) => {
    const pet = req.body;
    pet._id = newId();
    debug(`insert pet`, pet);

    // insert pet into database
    await insertOnePet(pet);
    res.json({ message: 'Pet inserted.' });
  })
);
router.put(
  '/:petId',
  validId('petId'),
  validBody(updatePetSchema),
  asyncCatch(async (req, res, next) => {
    const petId = req.petId;
    const update = req.body;
    debug(`update pet ${petId}`, update);

    // update pet, if they exist
    const pet = await findPetById(petId);
    if (!pet) {
      res.status(404).json({ error: `Pet ${petId} not found.` });
    } else {
      await updateOnePet(petId, update);
      res.json({ message: `Pet ${petId} updated.` });
    }
  })
);
router.delete(
  '/:petId',
  validId('petId'),
  asyncCatch(async (req, res, next) => {
    const petId = req.petId;
    debug(`delete pet ${petId}`);

    // delete pet if they exist
    const pet = await findPetById(petId);
    if (!pet) {
      res.status(404).json({ error: `Pet ${petId} not found.` });
    } else {
      await deleteOnePet(petId);
      res.json({ message: `Pet ${petId} deleted.` });
    }
  })
);

// export router
module.exports = router;
