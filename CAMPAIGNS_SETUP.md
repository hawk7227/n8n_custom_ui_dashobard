# Campaigns Table Setup

This document explains how to set up and use the campaigns table in Supabase for storing email and MMS campaign data.

## Table Structure

The `campaigns` table stores all campaign configurations and data including:

- **Basic Info**: Campaign name, description, type (email/sms/both), status
- **Brand Association**: Links to the selected brand
- **Email Data**: Subject, body content, image conversion settings
- **MMS Data**: Text content and image URLs
- **Campaign Settings**: Recipient count, filters used
- **Performance Metrics**: Sent, delivered, opened, clicked counts
- **Timestamps**: Creation, scheduling, and completion times

## Setup Instructions

1. **Run the SQL Script**: Execute the `campaigns_table.sql` file in your Supabase SQL editor
2. **Verify Table Creation**: Check that the table was created successfully
3. **Test Permissions**: Ensure your application can read/write to the table

## Key Features

### Campaign Types
- `email`: Email-only campaigns
- `sms`: MMS-only campaigns  
- `both`: Combined email and MMS campaigns

### Campaign Status
- `draft`: Campaign is saved but not sent
- `active`: Campaign is currently running
- `paused`: Campaign is temporarily paused
- `completed`: Campaign has finished sending
- `archived`: Campaign is archived

### Data Storage
The table stores all campaign configuration including:
- Brand information and associations
- Email subject and body content
- MMS text and image URLs
- Campaign filters and recipient counts
- Performance tracking metrics

## Usage in the Application

The "Save Campaign" button in the Email/MMS Campaign page will:

1. Validate required fields (brand selection, content)
2. Generate a campaign name if not provided
3. Save all campaign data to the `campaigns` table
4. Show a success dialog with campaign details
5. Store the campaign as a "draft" status

## Future Enhancements

- Campaign editing functionality
- Campaign scheduling
- Campaign performance analytics
- Campaign templates
- Bulk campaign operations

## Security

The table includes Row Level Security (RLS) policies that should be customized based on your authentication setup and user permissions. 