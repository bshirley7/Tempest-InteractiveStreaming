import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return a simple test VAST XML to verify the endpoint works
  const testVastXml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="4.0">
  <Ad id="test-ad-123">
    <InLine>
      <AdSystem version="1.0">Tempest Test System</AdSystem>
      <AdTitle><![CDATA[Test Advertisement]]></AdTitle>
      <Description><![CDATA[This is a test ad to verify VAST XML parsing]]></Description>
      <Advertiser><![CDATA[Tempest Media]]></Advertiser>
      <Impression><![CDATA[http://localhost:3000/api/ads/impression?id=test-123]]></Impression>
      <Creatives>
        <Creative id="test-creative">
          <Linear>
            <Duration>00:00:15</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[http://localhost:3000/api/ads/tracking?event=start&id=test-123]]></Tracking>
              <Tracking event="complete"><![CDATA[http://localhost:3000/api/ads/tracking?event=complete&id=test-123]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough><![CDATA[http://localhost:3000]]></ClickThrough>
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080">
                <![CDATA[https://customer-ydgwaifmhmzkp7in.cloudflarestream.com/0f564cd843e73e2c0fe1c723cdb82e47/downloads/default.mp4]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

  return new NextResponse(testVastXml, {
    headers: { 
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}