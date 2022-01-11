const { Contact } = require('../../models');
const createError = require('http-errors');
const { NotFound } = require('http-errors');

class Contacts {
  async add(req, res) {
    const { _id } = req.user;
    const result = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json({
      status: 201,
      code: 201,
      data: {
        result: result,
      },
    });
  }

  async deleteById(req, res) {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId);
    res.json({
      status: 200,
      message: `Contact with id=${contactId} delete`,
      data: { result },
    });
  }

  async getAll(req, res) {
    const { _id } = req.user;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find({ owner: _id }, '', {
      skip,
      limit: Number(limit),
    }).populate('owner', '_id name email');
    res.json({
      status: 200,
      code: 200,
      data: {
        result: contacts,
      },
    });
  }

  async getById(req, res, next) {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);
    if (!result) {
      throw createError(404, `Contact with id=${contactId} not found`);
    }
    res.json({
      status: 200,
      code: 200,
      data: { result: result },
    });
  }

  async updateById(req, res, next) {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body, {
      new: true,
    });
    if (!result) {
      throw new NotFound(`Contact with id=${contactId} not found`);
    }
    res.json({
      status: 'success',
      code: 200,
      data: {
        result: result,
      },
    });
  }

  async updateFavorite(req, res, next) {
    const { contactId } = req.params;
    const { favorite } = req.body;
    const result = await Contact.findByIdAndUpdate(
      contactId,
      { favorite },
      {
        new: true,
      },
    );
    if (!result) {
      throw new NotFound(`Contact with id=${contactId} not found`);
    }
    res.json({
      status: 'success',
      code: 200,
      data: {
        result: result,
      },
    });
  }
}

module.exports = new Contacts();
