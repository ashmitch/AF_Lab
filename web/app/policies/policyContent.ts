export type PolicySection = { heading: string; paragraphs?: string[]; bullets?: string[] };

export const policies: Record<string, { title: string; summary: string; updated: string; draft: boolean; sections: PolicySection[] }> = {
  privacy: {
    title: "Privacy policy",
    summary: "How AF_Lab handles information when you visit the site.",
    updated: "22 October 2026",
    draft: true,
    sections: [
      { heading: "Operator and contact", paragraphs: [
        "AF_Lab is operated by [OPERATOR FULL LEGAL NAME], at [POSTAL ADDRESS]. For privacy questions, contact [PRIVACY CONTACT EMAIL]. Replace these placeholders before publishing."
      ]},
      { heading: "Information processed when you visit", paragraphs: [
        "When the website is hosted publicly, the hosting provider and infrastructure may process technical information such as IP address, date and time of access, requested URL, referrer, browser and device information, and server logs. Confirm the exact fields and retention periods with your chosen hosting provider before publishing.",
        "The current development version queries AF_Lab's PostgreSQL database to display statistical data. The database connection string must remain server-side and must never be exposed in browser code."
      ]},
      { heading: "Advertising and analytics", paragraphs: [
        "Draft status: this version of AF_Lab includes visual advertising placeholders only. It does not intentionally load Google AdSense or analytics scripts. Update this section before adding any advertising, analytics, embedded content, or other third-party services.",
        "If Google AdSense is enabled in future, disclose the actual advertising services and technology providers, purposes of processing, applicable legal bases, international transfers where relevant, retention details where available, and how visitors can manage consent. Link to the providers' current privacy information."
      ]},
      { heading: "Legal bases and recipients", paragraphs: [
        "The legal bases for processing depend on the actual services and configuration. Identify the applicable basis for each processing purpose under the GDPR and name the relevant recipients or recipient categories, including hosting, database, security, consent-management, advertising and analytics providers that you actually use."
      ]},
      { heading: "Retention, rights and complaints", paragraphs: [
        "State the retention periods or the criteria used to determine them after checking the relevant providers' settings and contracts.",
        "Depending on the circumstances, visitors may have rights to access, rectification, erasure, restriction, objection, data portability and withdrawal of consent. Visitors may also lodge a complaint with a competent data protection supervisory authority. Provide the correct contact route for requests."
      ]},
      { heading: "Changes", paragraphs: [
        "This policy should be updated whenever the site's data practices or providers change. The date at the top should reflect the last substantive review."
      ]}
    ]
  },
  cookies: {
    title: "Cookie policy",
    summary: "Cookies, local storage and visitor choices.",
    updated: "22 October 2026",
    draft: true,
    sections: [
      { heading: "Current state", paragraphs: [
        "This starter version uses no advertising tags and does not implement a cookie-consent banner. The site may still rely on strictly necessary technical storage or services depending on the deployed framework and hosting setup; audit the live site before publishing this statement."
      ]},
      { heading: "Advertising cookies", paragraphs: [
        "Do not publish this section as final until an advertising provider is selected. If Google AdSense is enabled, describe the actual cookie or local-storage technologies and purposes used, including ad delivery, frequency capping, fraud prevention, measurement and personalisation where applicable."
      ]},
      { heading: "Consent and preferences", paragraphs: [
        "Before enabling non-essential cookies or similar technologies where consent is required, implement a suitable consent mechanism that lets visitors make a genuine choice. Make it possible to revisit or change choices later and ensure tags respect the visitor's choice.",
        "For personalised Google ads to visitors in the EEA, UK and Switzerland, Google requires a Google-certified consent management platform integrated with the IAB Transparency and Consent Framework. Check Google's current requirements and certified CMP list during implementation."
      ]},
      { heading: "How to manage cookies", paragraphs: [
        "Visitors can also use browser controls to inspect or delete stored cookies, although blocking all cookies may affect some website functionality. Browser controls do not replace any consent choices that the site must provide."
      ]}
    ]
  },
  advertising: {
    title: "Advertising policy",
    summary: "How advertising may support a free public statistics website.",
    updated: "22 October 2026",
    draft: true,
    sections: [
      { heading: "Free access", paragraphs: [
        "AF_Lab intends to make its public statistics pages available without a subscription. Advertising may help cover hosting, data processing and maintenance costs."
      ]},
      { heading: "Ad placement and labelling", paragraphs: [
        "Advertising will be identified clearly and kept visually separate from statistics, navigation and editorial content. Ads should not imitate data rows, sort controls or site navigation, and should not obstruct use of the tables."
      ]},
      { heading: "Ad provider", paragraphs: [
        "No advertising provider is activated in this starter build. Google AdSense is the intended long-term option, subject to account approval and implementation. Update this page to identify the actual provider and link to its privacy and advertising information once selected."
      ]},
      { heading: "Personalised advertising and choices", paragraphs: [
        "Where required, visitors will be offered a suitable consent and preference interface before relevant advertising technologies run. Refusing optional advertising consent should not be misrepresented as consent. Actual ad behaviour must match the choices presented and the provider's requirements."
      ]},
      { heading: "Independence", paragraphs: [
        "Advertising does not determine statistical calculations or data presentation. AF_Lab is an independent project and should not be presented as affiliated with or endorsed by the AFL unless that relationship is formally authorised."
      ]}
    ]
  },
  terms: {
    title: "Terms of use",
    summary: "Basic terms for using AF_Lab.",
    updated: "22 October 2026",
    draft: true,
    sections: [
      { heading: "Purpose of the site", paragraphs: [
        "AF_Lab provides AFL Fantasy statistical information for general information and analysis. It is not an official AFL service unless expressly stated otherwise."
      ]},
      { heading: "Accuracy and availability", paragraphs: [
        "We aim to present useful data, but source data, calculations and website availability may contain errors or interruptions. Check important figures against primary sources and do not treat projections or historical statistics as guarantees of future performance."
      ]},
      { heading: "Acceptable use", paragraphs: [
        "Do not attempt to disrupt the service, bypass access controls, overload the website, or use automated collection in a way that violates applicable law, source terms or reasonable technical restrictions."
      ]},
      { heading: "Data and intellectual property", paragraphs: [
        "The website's code, presentation and original analysis may be protected by applicable rights. Third-party names, marks and data remain subject to their respective rights and terms. Do not assume that publicly viewable data is free to reproduce commercially."
      ]},
      { heading: "Mandatory rights and liability", paragraphs: [
        "Replace this draft with terms reviewed for the operator's jurisdiction and actual business model. Nothing in these terms is intended to exclude liability or consumer rights that cannot lawfully be excluded or limited."
      ]}
    ]
  },
  "data-sources": {
    title: "Data sources & methodology",
    summary: "Where the numbers come from and how to interpret them.",
    updated: "22 October 2026",
    draft: true,
    sections: [
      { heading: "Data sources", paragraphs: [
        "List every source actually used in the deployed pipeline, including the relevant URLs, data owners, update frequency, licence or terms, and attribution requirements. Do not publish this page as complete until the rights and terms for each source have been checked.",
        "AF_Lab's development pipeline has used AFL Fantasy player data and AFL Tables match/statistics pages. Confirm the permitted use and attribution conditions for each source before monetising or republishing derived data."
      ]},
      { heading: "Processing pipeline", paragraphs: [
        "The project uses a data pipeline and dbt models to organise source data into dimensions, facts and analytical marts, which are stored in PostgreSQL and queried by the website. Update this description if the deployed architecture changes."
      ]},
      { heading: "Averages and splits", paragraphs: [
        "For each published statistic, define the unit, match scope, season or seasons included, treatment of missing values, minimum sample size if any, and whether values are arithmetic averages or another measure. Ensure the explanation matches the SQL model used to calculate it."
      ]},
      { heading: "Corrections and limitations", paragraphs: [
        "Historical data can be revised, player/team identifiers can change, and small samples can produce misleading averages. For corrections, contact [CONTACT EMAIL]."
      ]},
      { heading: "Independence and trademarks", paragraphs: [
        "AF_Lab is an independent project and is not affiliated with, endorsed by, or sponsored by the AFL unless a formal relationship is stated. AFL and team names or marks may belong to their respective owners."
      ]}
    ]
  },
  "adsense-setup": {
    title: "AdSense launch checklist",
    summary: "Technical checklist for adding Google AdSense when the site is ready.",
    updated: "22 October 2026",
    draft: true,
    sections: [
      { heading: "Before applying", paragraphs: [
        "Publish useful original content, make the site easy to navigate, verify all pages work on mobile and desktop, and ensure the site complies with current AdSense programme policies. Approval is not guaranteed."
      ]},
      { heading: "After approval", bullets: [
        "Add the exact AdSense script and publisher ID provided in your account; do not guess or copy another publisher's ID.",
        "Publish and verify the ads.txt record using the exact line Google provides.",
        "Choose a Google-certified CMP that integrates with the IAB TCF for personalised ads in the EEA, UK and Switzerland; review Google's current certified list.",
        "Configure consent messages, advertising technology providers and privacy disclosures to match the services actually enabled.",
        "Test that ad scripts and consent signals behave correctly for visitors who accept, reject or customise optional choices.",
        "Update the Privacy, Cookie and Advertising policies before switching ads on."
      ]},
      { heading: "Official documentation", paragraphs: [
        "Google AdSense consent requirements: https://support.google.com/adsense/answer/13554116",
        "AdSense programme policies and eligibility: https://support.google.com/adsense/"
      ]}
    ]
  }
};
