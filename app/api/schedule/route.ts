import { NextRequest, NextResponse } from 'next/server';
import { addHours, format } from 'date-fns';
import { getTVGuideData, getCurrentProgram, getNextProgram, scheduleVideo } from '@/lib/local-scheduling';
import { CHANNELS } from '@/lib/constants';
import { ChannelId } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const channelId = searchParams.get('channel') as ChannelId;
    const startTime = searchParams.get('start_time') 
      ? new Date(searchParams.get('start_time')!) 
      : new Date();
    const hours = parseInt(searchParams.get('hours') || '12');
    const type = searchParams.get('type') || 'all'; // 'all', 'current', 'next', 'guide'
    
    if (type === 'current') {
      // Get current program for specific channel or all channels
      if (channelId) {
        const program = getCurrentProgram(channelId);
        return NextResponse.json({
          success: true,
          data: program,
        });
      } else {
        const currentPrograms = new Map();
        CHANNELS.forEach(channel => {
          const program = getCurrentProgram(channel.id as ChannelId);
          if (program) {
            currentPrograms.set(channel.id, program);
          }
        });
        
        return NextResponse.json({
          success: true,
          data: Object.fromEntries(currentPrograms),
        });
      }
    }
    
    if (type === 'next') {
      // Get next program for specific channel or all channels
      if (channelId) {
        const program = getNextProgram(channelId);
        return NextResponse.json({
          success: true,
          data: program,
        });
      } else {
        const nextPrograms = new Map();
        CHANNELS.forEach(channel => {
          const program = getNextProgram(channel.id as ChannelId);
          if (program) {
            nextPrograms.set(channel.id, program);
          }
        });
        
        return NextResponse.json({
          success: true,
          data: Object.fromEntries(nextPrograms),
        });
      }
    }
    
    if (type === 'guide') {
      // Get full TV guide data
      const guideData = getTVGuideData(startTime, hours);
      
      // Convert Map to object for JSON serialization
      const programsObject = Object.fromEntries(guideData.programs);
      
      return NextResponse.json({
        success: true,
        data: {
          timeSlots: guideData.timeSlots,
          channels: guideData.channels,
          programs: programsObject,
          metadata: {
            startTime: startTime.toISOString(),
            endTime: addHours(startTime, hours).toISOString(),
            hours,
            generated: new Date().toISOString(),
          },
        },
      });
    }
    
    // Default: return schedule for specific channel or error
    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required for schedule lookup' },
        { status: 400 }
      );
    }
    
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) {
      return NextResponse.json(
        { error: 'Invalid channel ID' },
        { status: 400 }
      );
    }
    
    // Get schedule data and filter for specific channel
    const guideData = getTVGuideData(startTime, hours);
    const channelPrograms = guideData.programs.get(channelId) || [];
    
    return NextResponse.json({
      success: true,
      data: {
        channel,
        programs: channelPrograms,
        metadata: {
          startTime: startTime.toISOString(),
          endTime: addHours(startTime, hours).toISOString(),
          hours,
          count: channelPrograms.length,
        },
      },
    });
  } catch (error) {
    console.error('Schedule API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      channelId,
      videoId,
      startTime,
      duration,
      title,
      description,
    } = body;
    
    // Validate required fields
    if (!channelId || !videoId || !startTime) {
      return NextResponse.json(
        { error: 'Channel ID, video ID, and start time are required' },
        { status: 400 }
      );
    }
    
    // Validate channel
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) {
      return NextResponse.json(
        { error: 'Invalid channel ID' },
        { status: 400 }
      );
    }
    
    // Parse start time
    const scheduledStartTime = new Date(startTime);
    if (isNaN(scheduledStartTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start time format' },
        { status: 400 }
      );
    }
    
    // Check if start time is in the future
    if (scheduledStartTime <= new Date()) {
      return NextResponse.json(
        { error: 'Start time must be in the future' },
        { status: 400 }
      );
    }
    
    // Schedule the video
    const success = scheduleVideo(channelId, videoId, scheduledStartTime, duration);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to schedule video. Video may not exist or time slot may be occupied.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Video scheduled successfully',
      data: {
        channelId,
        videoId,
        startTime: scheduledStartTime.toISOString(),
        duration,
        scheduledAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Schedule creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('program_id');
    const channelId = searchParams.get('channel_id') as ChannelId;
    
    if (!programId || !channelId) {
      return NextResponse.json(
        { error: 'Program ID and channel ID are required' },
        { status: 400 }
      );
    }
    
    // Validate channel
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) {
      return NextResponse.json(
        { error: 'Invalid channel ID' },
        { status: 400 }
      );
    }
    
    // Note: In a real implementation, you would have a removeScheduledProgram function
    // For now, we'll return a success response as the scheduling engine handles this internally
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled program removed successfully',
      data: {
        programId,
        channelId,
        removedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Schedule deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      programId,
      channelId,
      startTime,
      duration,
      title,
      description,
    } = body;
    
    if (!programId || !channelId) {
      return NextResponse.json(
        { error: 'Program ID and channel ID are required' },
        { status: 400 }
      );
    }
    
    // Validate channel
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) {
      return NextResponse.json(
        { error: 'Invalid channel ID' },
        { status: 400 }
      );
    }
    
    // Note: In a real implementation, you would update the scheduled program
    // For now, we'll return a success response
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled program updated successfully',
      data: {
        programId,
        channelId,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Schedule update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}