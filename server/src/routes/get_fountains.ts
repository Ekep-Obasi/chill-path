import * as https from "https";
import { Request, Response } from "express";
import { IncomingMessage } from "http";

// Type definitions for the API responses
interface Resource {
  id: string;
  name: string;
  description: string;
  datastore_active: boolean;
}

interface PackageData {
  id: string;
  name: string;
  notes: string;
  resources: Resource[];
}

interface DatastoreResponse {
  records: any[];
}

interface ResourceWithData {
  resourceId: string;
  resourceName: string;
  resourceDescription: string;
  data: any[];
  coordinates?: CoordinateInfo[];
}

interface CoordinateInfo {
  recordId: string | number;
  latitude?: number;
  longitude?: number;
  address?: string;
  type?: string;
  description?: string;
}

interface AllPackageData {
  packageId: string;
  packageName: string;
  packageDescription: string;
  resources: ResourceWithData[];
}

// Updated interface for fountain response
interface FountainInfo {
  latitude: number;
  longitude: number;
  type?: string;
  description?: string;
  address?: string;
  recordId?: string | number;
}

// Generic function to make HTTPS requests
const makeRequest = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    https.get(url, (response: IncomingMessage) => {
      let dataChunks: Buffer[] = [];
      response
        .on("data", (chunk: Buffer) => {
          dataChunks.push(chunk);
        })
        .on("end", () => {
          try {
            const data = Buffer.concat(dataChunks);
            const jsonData = JSON.parse(data.toString());
            resolve(jsonData.result);
          } catch (error) {
            reject(error);
          }
        })
        .on("error", (error: Error) => {
          reject(error);
        });
    });
  });
};

// Function to extract coordinates from record data
const extractCoordinates = (records: any[]): CoordinateInfo[] => {
  return records.map((record, index) => {
    const coordInfo: CoordinateInfo = {
      recordId: record._id || record.id || index,
    };

    // Look for common coordinate field names
    const latFields = ["latitude", "lat", "Latitude", "LAT", "y", "Y"];
    const lonFields = [
      "longitude",
      "lng",
      "lon",
      "Longitude",
      "LON",
      "LONGITUDE",
      "x",
      "X",
    ];

    // Extract latitude
    for (const field of latFields) {
      if (record[field] !== undefined && record[field] !== null) {
        coordInfo.latitude = parseFloat(record[field]);
        break;
      }
    }

    // Extract longitude
    for (const field of lonFields) {
      if (record[field] !== undefined && record[field] !== null) {
        coordInfo.longitude = parseFloat(record[field]);
        break;
      }
    }

    // Handle geometry field - extract just the coordinates
    if (record.geometry) {
      try {
        let geometry = record.geometry;

        // If it's a string, parse it
        if (typeof geometry === "string") {
          geometry = JSON.parse(geometry);
        }

        // Extract coordinates from GeoJSON Point
        if (geometry.coordinates && Array.isArray(geometry.coordinates)) {
          coordInfo.longitude = coordInfo.longitude || geometry.coordinates[0];
          coordInfo.latitude = coordInfo.latitude || geometry.coordinates[1];
          // Don't store geometry at all, just use lat/lon
        }
      } catch (e) {
        // If parsing fails, skip geometry
        console.warn("Failed to parse geometry:", e);
      }
    }

    // Look for address or location description
    const addressFields = [
      "address",
      "location",
      "Address",
      "LOCATION",
      "street_address",
    ];
    for (const field of addressFields) {
      if (record[field]) {
        coordInfo.address = record[field];
        break;
      }
    }

    // Look for type information
    const typeFields = [
      "type",
      "Type",
      "TYPE",
      "category",
      "Category",
      "CATEGORY",
      "fountain_type",
      "kind",
    ];
    for (const field of typeFields) {
      if (record[field]) {
        coordInfo.type = record[field];
        break;
      }
    }

    // Look for description information
    const descriptionFields = [
      "description",
      "Description",
      "DESCRIPTION",
      "notes",
      "Notes",
      "NOTES",
      "details",
      "info",
    ];
    for (const field of descriptionFields) {
      if (record[field]) {
        coordInfo.description = record[field];
        break;
      }
    }

    return coordInfo;
  });
};

async function getAllPackageData(packageId: string): Promise<AllPackageData> {
  try {
    // Get package metadata
    const packageUrl = `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=${packageId}`;
    const packageData = (await makeRequest(packageUrl)) as PackageData;

    // Filter to get only datastore-active resources
    const datastoreResources = packageData.resources.filter(
      (r: Resource) => r.datastore_active,
    );

    if (datastoreResources.length === 0) {
      throw new Error("No datastore resources found for this package");
    }

    // Get data from all datastore resources
    const allResourceData: ResourceWithData[] = await Promise.all(
      datastoreResources.map(
        async (resource: Resource): Promise<ResourceWithData> => {
          const resourceUrl = `https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?id=${resource.id}&limit=10000`;
          const resourceData = (await makeRequest(
            resourceUrl,
          )) as DatastoreResponse;

          // Extract coordinates from the records
          const coordinates = extractCoordinates(resourceData.records);

          return {
            resourceId: resource.id,
            resourceName: resource.name,
            resourceDescription: resource.description,
            data: resourceData.records,
            coordinates: coordinates,
          };
        },
      ),
    );

    return {
      packageId: packageData.id,
      packageName: packageData.name,
      packageDescription: packageData.notes,
      resources: allResourceData,
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch package data: ${error.message}`);
  }
}

// Express route handler for getting fountains data (with type and description)
const getFountains = async (req: Request, res: Response): Promise<void> => {
  try {
    const packageId = "f614d4d3-594a-4f78-8473-faaa17269c67"; // Toronto fountains package ID

    const data = await getAllPackageData(packageId);

    // Extract coordinates with type and description from all resources
    const allFountains: FountainInfo[] = [];

    data.resources.forEach((resource) => {
      if (resource.coordinates) {
        resource.coordinates.forEach((coord) => {
          if (coord.latitude && coord.longitude) {
            allFountains.push({
              latitude: coord.latitude,
              longitude: coord.longitude,
              type: coord.type,
              description: coord.description,
              address: coord.address,
              recordId: coord.recordId,
            });
          }
        });
      }
    });

    // Send the enhanced fountains array
    res.json(allFountains);
  } catch (error: any) {
    console.error("Error fetching fountains data:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch fountains data",
      error: error.message,
    });
  }
};

// Alternative route handler that accepts package ID as parameter
const getPackageData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { packageId } = req.params;

    if (!packageId) {
      res.status(400).json({
        success: false,
        message: "Package ID is required",
      });
      return;
    }

    const data = await getAllPackageData(packageId);

    res.json({
      success: true,
      message: "Package data retrieved successfully",
      data: data,
    });
  } catch (error: any) {
    console.error("Error fetching package data:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch package data",
      error: error.message,
    });
  }
};

// Export the route handlers and types
export {
  getFountains,
  getPackageData,
  getAllPackageData,
  ResourceWithData,
  CoordinateInfo,
  FountainInfo,
};
