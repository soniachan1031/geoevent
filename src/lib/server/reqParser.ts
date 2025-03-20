import AppError from "./AppError";

const parseJson = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    throw new AppError(400, "Invalid json format");
  }
};

const parseFormData = async (req: Request) => {
  try {
    return await req.formData();
  } catch {
    throw new AppError(400, "Invalid form data");
  }
};

export { parseJson, parseFormData };
