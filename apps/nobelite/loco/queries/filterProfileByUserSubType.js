module.exports = async function (knex, valueFromSource, transformation) {
  let inputValue = valueFromSource[transformation.findByValue];

  console.log("someone called me.......", inputValue);

  //   const result = await knex.raw(
  //     "select profiles.uuid, profiles.data->>'userSubTypes' as subTypes from profiles where profiles.data->>'userSubTypes' is not null and (profiles.data->'userSubTypes')::jsonb \\?| array['Stockist']"
  //   );

  //   transformedValue = transformedValue.data.map((t) => {
  //     return t[transformation.extract];
  //   });

  return [];
};
