// import Script from 'next/script'
// import React from 'react'

// function GoogleSuccessTrackTag() {
//   return (
//     <>
//       <Script strategy='afterInteractive' id="google-success-conversion">
//         {
//           `
//                 gtag('event', 'conversion', {'send_to': '${process.env.NEXT_PUBLIC_GOOGLE_SUCCESS_PAGE_EVENT_CONVERSION_ID}'});
//                 `
//         }
//       </Script>
//     </>
//   )
// }

// export default GoogleSuccessTrackTag
import Script from 'next/script'
import React from 'react'

function GoogleSuccessTrackTag() {
    const conversionId =
        process.env.NEXT_PUBLIC_GOOGLE_SUCCESS_PAGE_EVENT_CONVERSION_ID
    const trackingId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID // Optional, if needed for gtag init

    return (
        <>
            {/* Load gtag.js from Google */}
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${trackingId}`}
                strategy="afterInteractive"
            />

            {/* Initialize gtag */}
            <Script id="gtag-init" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${trackingId}');
        `}
            </Script>

            {/* Track success conversion */}
            <Script id="google-success-conversion" strategy="afterInteractive">
                {`
          if (typeof gtag === 'function') {
            gtag('event', 'conversion', {'send_to': '${conversionId}'});
          }
        `}
            </Script>
        </>
    )
}

export default GoogleSuccessTrackTag
