import GoogleHomePixel from 'lib/pixel/GoogleHomePixel'
import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="icon" href="/favicon.png" />
                <meta
                    name="facebook-domain-verification"
                    content="rqs2usp8p1t5m1e6b1tu2vxgd6f0sr"
                />
                <meta name="title" content="Wheeliyo" />
                <meta
                    name="keywords"
                    content="car dealers, car dealership near me, cars for sale near me, ford dealership near me, toyota dealership, honda dealership, ford dealership, toyota dealership near me, carmax near me, honda dealership near me, chevy dealership, dodge dealership, used car dealerships near me, nissan dealership,  buy here pay here near me, "
                />
                <meta name="robots" content="index, follow" />
                <meta
                    httpEquiv="Content-Type"
                    content="text/html; charset=utf-8"
                />
                <meta name="language" content="English" />
                <meta name="revisit-after" content="1 days" />

                <GoogleHomePixel />

                <script
                    id="facebook-pixel"
                    dangerouslySetInnerHTML={{
                        __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '567128831933703');fbq('track', 'PageView');`,
                    }}
                />
            </Head>

            <body>
                <noscript
                    dangerouslySetInnerHTML={{
                        __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
                    }}
                ></noscript>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
