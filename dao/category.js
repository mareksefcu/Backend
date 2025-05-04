
const uri = "mongodb+srv://marsefcu:020702@cluster0.t4fqsaw.mongodb.net/?appName=Cluster0";
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb'); // Add ObjectId
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function create(list)
{
  try {

    const resultCreate= await client.db("CategoryList").collection("CatList").insertOne(list)
    console.log("Vložené ID dokumentu", resultCreate.insertedId);
    return resultCreate

  } catch (err) {
    console.error("Problém s dokumentem", err);
  } 
}

async function remove(categoryId) {
  try {
    // Convert string to ObjectId
    const objectId = new ObjectId(categoryId); 

    const resultDelete = await client
      .db("CategoryList")
      .collection("CatList")
      // Now this matches MongoDB id type
      .deleteOne({ _id: objectId }); 
    // Debug log: check what's left
    const result = await client
      .db("CategoryList")
      .collection("CatList")
      .find()
      .toArray();
    console.log(result);

    return resultDelete;
  } catch (error) {
    console.error("Chyba při mazání kategorie:", error);
    throw { code: "failedToRemoveCategory", category: categoryId, details: error };
  }
}

async function getCategoryMap() {
  const categoryMap = {};
  const categoryList = await list(); // now it's async
  categoryList.forEach((category) => {
    categoryMap[category.id] = category;
  });
  return categoryMap;
}
async function list() {
  try {
    console.log("Connecting to MongoDB to list categories");

    const resultList = await client
      .db("CategoryList")
      .collection("CatList")
      .find()
      .toArray();

    console.log("Categories fetched:", resultList);
    return resultList;
  } catch (error) {
    console.error("Error in DAO list():", error);
    throw { code: "failedToListCategories", category: error };
  }
}
module.exports = {
  create,
  remove,
  list
}

