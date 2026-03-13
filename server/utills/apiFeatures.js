class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  fields() {
    const fileds = ["page", "sort", "limit", "fields"];
    let queryObj = { ...this.queryString };
    fileds.forEach((el) => {
      delete queryObj[el];
    });
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  page() {
  const page = parseInt(this.queryString.page) || 1;
  const limit = parseInt(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  limit() {
  if(this.queryString.fields){
  const filedsfilterall = this.queryString.fields.split(',').join(' ');
  this.query=this.query.select(filedsfilterall);

  }else{
      this.query = this.query.select("-__v");
  }
return this;
  }
}

module.exports = ApiFeatures;
