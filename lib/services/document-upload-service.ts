import { ProcessorFactory } from "@/lib/integrations/microsoft/processors/processor-factory";
import { updateKnowledgeSourceStatus } from "@/lib/db/queries";

/**
 * Process a document and add it to the knowledge base
 * @param userId User ID
 * @param fileName File name
 * @param content File content as ArrayBuffer
 * @param metadata Additional metadata
 * @returns Created knowledge source
 */
export async function processDocument(
  userId: string,
  fileName: string,
  content: ArrayBuffer,
  metadata: Record<string, any> = {}
) {
  try {
    // Get the appropriate processor
    const processor = ProcessorFactory.getProcessor(userId, fileName, metadata);

    // Process the document (this will create a knowledge source and chunks)
    const source = await processor.processDocument(content, fileName);

    // Ensure the status is set to pending
    await updateKnowledgeSourceStatus({
      id: source.id,
      status: "pending"
    });

    return source;
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
}