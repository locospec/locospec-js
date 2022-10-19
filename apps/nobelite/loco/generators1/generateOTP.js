const knex = requireKnex();

const generateOTP = async (resourceSpec, identifier, length = 6) => {
  // return Math.floor(100000 + Math.random() * 900000);

  var digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }

  // console.log("identifier", identifier, length);

  let count = await knex(resourceSpec.meta.table)
    .where(identifier, "=", `${otp}`)
    .count({ count: "*" })
    .first();

  count = parseInt(count.count);
  let finalOtp = count === 0 ? otp : `${otp}${count}`;

  if (count) {
    console.log("finalOtp", finalOtp);
  }

  return finalOtp;
};

module.exports = generateOTP;
