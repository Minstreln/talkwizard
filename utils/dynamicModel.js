const mongoose = require('mongoose');

const dynamicModels = {};

const getDynamicModel = (category) => {
  if (category) {
    const dynamicSchema = new mongoose.Schema({
      name: {
        type: String,
        default: category,
      },
      advisor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advisor',
      }],
    });

    const dynamicModel = mongoose.model(`${category.replace(/\s/g, '')}`, dynamicSchema);
    dynamicModels.push(category);
    return dynamicModel;
  } else {
    return mongoose.model(`${category.replace(/\s/g, '')}`);
  }
};

module.exports = getDynamicModel;
