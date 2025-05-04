
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = "mongodb+srv://marsefcu:020702@cluster0.t4fqsaw.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectClient() {
    if (!client.isConnected?.()) {
        await client.connect();
    }
}

async function getCategoryByName(categoryName) {
    if (!categoryName || typeof categoryName !== "string") return null;
    await connectClient();
    try {
        const category = await client
            .db("CategoryList")
            .collection("CatList")
            .findOne({ name: categoryName });
        return category;
    } catch (e) {
        console.error("Error finding category by name:", e);
        return null;
    }
}

async function create(zapisek) {
    try {
        await connectClient();
        if (!zapisek.name || !zapisek.details || !zapisek.categoryName) {
            throw new Error("Missing required fields: name, details, or categoryName");
        }
        const category = await getCategoryByName(zapisek.categoryName);
        if (!category) {
            throw new Error(`Invalid categoryName: '${zapisek.categoryName}' does not exist`);
        }
        const newZapisek = {
            name: zapisek.name,
            details: zapisek.details,
            categoryId: category._id,
            categoryName: category.name,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const resultCreate = await client
            .db("ZapisekList")
            .collection("ZapList")
            .insertOne(newZapisek);
        console.log("Inserted zapisek with ID:", resultCreate.insertedId);
        return { ...newZapisek, _id: resultCreate.insertedId };
    } catch (err) {
        console.error("Error creating zapisek:", err);
        throw err;
    }
}

async function remove(zapisekId) {
    try {
        await connectClient();
        const objectId = new ObjectId(zapisekId);
        const resultDelete = await client
            .db("ZapisekList")
            .collection("ZapList")
            .deleteOne({ _id: objectId });
        console.log("Deleted count:", resultDelete.deletedCount);
        return resultDelete;
    } catch (error) {
        console.error("Error deleting zapisek:", error);
        throw { code: "failedToRemoveNote", zapisek: zapisekId, details: error };
    }
}

async function list() {
    try {
        await connectClient();
        const resultList = await client
            .db("ZapisekList")
            .collection("ZapList")
            .find()
            .toArray();
        return resultList;
    } catch (error) {
        console.error("Error listing zapisek:", error);
        throw { code: "failedToListNotes", zapisek: error };
    }
}

async function update(zapisek) {
    try {
        await connectClient();
        const objectId = new ObjectId(zapisek.id);
        const updatedZapisekData = {
            name: zapisek.name,
            details: zapisek.details,
            categoryId: zapisek.categoryId, // Assuming you're passing categoryId in the update
            categoryName: zapisek.categoryName, // Assuming you're passing categoryName in the update
            updatedAt: new Date(),
        };
        const resultUpdate = await client
            .db("ZapisekList")
            .collection("ZapList")
            .updateOne({ _id: objectId }, { $set: updatedZapisekData });
        console.log("Updated count:", resultUpdate.modifiedCount);
        return { _id: zapisek.id, ...updatedZapisekData };
    } catch (error) {
        console.error("Error updating zapisek:", error);
        throw { code: "failedToUpdateNote", zapisek: zapisek.id, details: error };
    }
}

async function take(zapisekId) {
    try {
        await connectClient();
        const objectId = new ObjectId(zapisekId);
        const zapisek = await client
            .db("ZapisekList")
            .collection("ZapList")
            .findOne({ _id: objectId });
        return zapisek;
    } catch (error) {
        console.error("Error getting zapisek:", error);
        throw { code: "failedToReadNote", zapisek: zapisekId, details: error };
    }
}

async function getByName(name) {
    try {
      await connectClient();
  
      if (!name || typeof name !== "string") {
        throw new Error("Invalid or missing 'name' parameter");
      }
  
      const zapisek = await client
        .db("ZapisekList")
        .collection("ZapList")
        .findOne({ name });
  
      return zapisek;
    } catch (error) {
      console.error("Error in getByName:", error);
      throw { code: "failedToFindZapisek", message: "Could not find zapisek by name", error };
    }
  }

  async function download(name) {
    try {
      await connectClient();
  
      if (!name || typeof name !== "string") {
        throw { code: "invalidName", message: "Name must be a non-empty string." };
      }
  
      const zapisek = await client
        .db("ZapisekList")
        .collection("ZapList")
        .findOne({ name });
  
      if (!zapisek) {
        throw { code: "zapisekNotFound", message: `No zapisek found with name '${name}'.` };
      }
  
      return zapisek;
    } catch (error) {
      console.error("Error in DAO download():", error);
      throw {
        code: "failedToDownloadZapisek",
        message: "Failed to retrieve zapisek for download.",
        error,
      };
    }
  }

module.exports = {
    create,
    remove,
    list,
    getCategoryByName,
    update,
    take,
    getByName,
    download
};