let getPaginatedList = function (mongooseModel, offset, findQuery, orderBy, callback, select) {
  let limit = Number(process.env.DEFAULT_PAGE_SIZE);

  // validate offset
  if (!Number(offset)) {
    offset = 0;
  } else {
    // validate it from non negative
    offset = Math.max(1, Number(offset));
  }

  // validating findQuery
  if (!findQuery) {
    findQuery = {};
  }

  // validate order
  if (!orderBy) {
    orderBy = {createdAt: -1};
  } else if (typeof orderBy == 'number') {
    orderBy = {createdAt: orderBy}
  }

  // Run the query
  if (select) {
    mongooseModel.find(findQuery).sort(orderBy).select(select).limit(limit).skip(limit * offset).exec(callback);
  } else {
    mongooseModel.find(findQuery).sort(orderBy).limit(limit).skip(limit * offset).exec(callback);
  }
};


// export related modules
module.exports = {
  getPaginatedList
};