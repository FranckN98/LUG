import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import {
  createContestEntry,
  checkEmailExists,
  isContestFull,
  hashScreenshot,
  checkScreenshotDuplicate,
} from '@/lib/lemfiContest';
import { sendContestConfirmationEmail, sendAdminValidationAlert } from '@/lib/lemfiContestEmail';
import { prisma } from '@/lib/prisma';

// Max 5 MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract fields
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const consentGiven = formData.get('consentGiven') === 'true';
    const file = formData.get('screenshot') as File;

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Consent is required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'Screenshot is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, and WebP formats are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File must be smaller than 5 MB' },
        { status: 400 }
      );
    }

    // Check if contest is full
    if (await isContestFull()) {
      return NextResponse.json(
        { error: 'Contest is full', isFull: true },
        { status: 409 }
      );
    }

    // Check if email already exists
    if (await checkEmailExists(email.toLowerCase().trim())) {
      return NextResponse.json(
        { error: 'This email is already registered' },
        { status: 409 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Hash screenshot for duplicate detection
    const screenshotHash = hashScreenshot(buffer);

    // Check for duplicate screenshots
    if (await checkScreenshotDuplicate(screenshotHash)) {
      return NextResponse.json(
        { error: 'This screenshot has already been submitted' },
        { status: 409 }
      );
    }

    // Upload to Vercel Blob
    const timestamp = Date.now();
    const filename = `lemfi-contest/${timestamp}-${file.name}`;

    let screenshotUrl: string;
    try {
      const blob = await put(filename, buffer, {
        access: 'private',
        contentType: file.type,
        addRandomSuffix: true,
      });
      screenshotUrl = blob.url;
    } catch (blobError) {
      console.error('Blob upload failed:', blobError);
      return NextResponse.json(
        { error: 'Failed to upload screenshot' },
        { status: 500 }
      );
    }

    // Create contest entry
    let result;
    try {
      result = await createContestEntry({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        screenshotUrl,
        screenshotHash,
        consentGiven,
      });
    } catch (dbError: any) {
      if (dbError.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'This email is already registered' },
          { status: 409 }
        );
      }
      if (dbError.message.includes('Contest is full')) {
        return NextResponse.json(
          { error: 'Contest is full', isFull: true },
          { status: 409 }
        );
      }
      throw dbError;
    }

    // Send confirmation email (non-blocking)
    sendContestConfirmationEmail({
      email: result.entry.email,
      firstName: result.entry.firstName,
      displayNumber: result.displayNumber,
      accessToken: result.entry.accessToken,
    }).catch((err) => console.error('Confirmation email failed:', err));

    // Send admin alert (non-blocking)
    sendAdminValidationAlert({
      displayNumber: result.displayNumber,
      email: result.entry.email,
      firstName: result.entry.firstName,
      lastName: result.entry.lastName,
    }).catch((err) => console.error('Admin alert failed:', err));

    // Return success
    return NextResponse.json(
      {
        success: true,
        displayNumber: result.displayNumber,
        accessToken: result.entry.accessToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
