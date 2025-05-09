import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { processDocument } from "@/lib/services/document-upload-service";
import { recordKnowledgeBaseMetric } from "@/lib/services/metrics-service";

// File size limit (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  "application/pdf", // PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "text/plain", // TXT
];

// File extensions mapping
const FILE_EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Validate files
    const validFiles: { file: File; buffer: ArrayBuffer }[] = [];
    const errors: { fileName: string; error: string }[] = [];

    for (const file of files) {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push({
          fileName: file.name,
          error: `Invalid file type: ${file.type}. Only PDF, DOCX, and TXT files are allowed.`,
        });
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push({
          fileName: file.name,
          error: `File size exceeds the 10MB limit: ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)}MB`,
        });
        continue;
      }

      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      validFiles.push({ file, buffer });
    }

    // If no valid files, return error
    if (validFiles.length === 0) {
      return NextResponse.json(
        {
          error: "No valid files to process",
          details: errors,
        },
        { status: 400 }
      );
    }

    // Process valid files
    const results = [];
    for (const { file, buffer } of validFiles) {
      try {
        const startTime = Date.now();
        
        // Create metadata
        const metadata = {
          originalFilename: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedBy: session.user.id,
          uploadedAt: new Date().toISOString(),
        };

        // Get file extension
        const extension =
          FILE_EXTENSIONS[file.type] ||
          file.name.split(".").pop()?.toLowerCase() ||
          "txt";

        // Process document (set status to pending)
        const source = await processDocument(
          session.user.id,
          file.name,
          buffer,
          metadata
        );
        
        const endTime = Date.now();
        const processingTime = endTime - startTime;
        
        // Record knowledge base upload metric
        recordKnowledgeBaseMetric({
          userId: session.user.id,
          operation: 'upload',
          knowledgeSourceId: source.id,
          responseTime: processingTime,
          metadata: {
            fileType: file.type,
            fileSize: file.size,
            fileName: file.name,
          }
        });

        results.push({
          id: source.id,
          fileName: file.name,
          title: source.title,
          status: "pending",
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push({
          fileName: file.name,
          error: `Failed to process file: ${(error as Error).message}`,
        });
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      processed: results.length,
      failed: errors.length,
      sources: results,
      errors,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      {
        error: "Failed to process files",
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}