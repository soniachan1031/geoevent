import bcrypt from "bcrypt";

/**
 * Hashes a string using bcrypt.
 *
 * @param {string} string - The string to be hashed.
 * @return {Promise<string>} A promise that resolves to the hashed string.
 */
export const encryptString = async (string: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
  const hash = await bcrypt.hash(string, salt); // Hash the string
  return hash;
};

/**
 * Verifies if a given string matches an encrypted string.
 *
 * @param {string} string - The string to be verified.
 * @param {string} encryptedString - The encrypted string to compare against.
 * @return {Promise<boolean>} A promise that resolves to true if the string matches the encrypted string, false otherwise.
 */
export const verifyEncryptedString = async (
  string: string,
  encryptedString: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(string, encryptedString);
  } catch (err) {
    console.error("Error verifying string:", err);
    // Handle error appropriately (e.g., log and return false)
    return false;
  }
};
