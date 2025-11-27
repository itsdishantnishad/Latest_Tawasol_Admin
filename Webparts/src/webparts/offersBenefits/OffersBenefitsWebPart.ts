import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneSlider
} from '@microsoft/sp-webpart-base';
import OffersBenefits, { IOffersBenefitsProps } from './components/OffersBenefits';

export interface IOffersBenefitsWebPartProps {
  source: 'placeholder' | 'api';
  apiBaseUrl?: string;
  apiMedicalPath?: string;
  apiPrivilegesPath?: string;
  cacheMinutes: number;
  maxItems: number;
  placeholderMedical: string;
  placeholderPrivileges: string;
  sectionTitlePrivileges?: string;
  /** optional breadcrumb home */
  homeUrl?: string;
}

export default class OffersBenefitsWebPart
  extends BaseClientSideWebPart<IOffersBenefitsWebPartProps> {

  public async onInit(): Promise<void> {
    // defaults
    this.properties.source = this.properties.source || 'placeholder';
    this.properties.cacheMinutes = this.properties.cacheMinutes ?? 5;
    this.properties.maxItems = this.properties.maxItems || 12;

    this.properties.placeholderMedical =
      this.properties.placeholderMedical || DEFAULT_PLACEHOLDER_MEDICAL_JSON;
    this.properties.placeholderPrivileges =
      this.properties.placeholderPrivileges || DEFAULT_PLACEHOLDER_PRIV_JSON;

    this.properties.sectionTitlePrivileges =
      this.properties.sectionTitlePrivileges ?? 'Core Direction';

    this.properties.homeUrl = this.properties.homeUrl || '/';
  }

  public render(): void {
    const props: IOffersBenefitsProps = {
      mode: this.properties.source,
      api: {
        baseUrl: this.properties.apiBaseUrl || '',
        medicalPath: this.properties.apiMedicalPath || '',
        privilegesPath: this.properties.apiPrivilegesPath || ''
      },
      placeholders: {
        medical: this.properties.placeholderMedical,
        privileges: this.properties.placeholderPrivileges
      },
      cacheMinutes: this.properties.cacheMinutes,
      maxItems: this.properties.maxItems,

      // component props (medical title unused but required by type)
      sectionTitleMedical: '',
      sectionTitlePrivileges: this.properties.sectionTitlePrivileges || '',

      homeUrl: this.properties.homeUrl
    };

    ReactDom.render(React.createElement(OffersBenefits, props), this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Offers & Benefits – Settings' },
          groups: [
            {
              groupName: 'Source',
              groupFields: [
                PropertyPaneDropdown('source', {
                  label: 'Mode',
                  options: [
                    { key: 'placeholder', text: 'Placeholders (no API)' },
                    { key: 'api', text: 'API' }
                  ]
                }),
                PropertyPaneSlider('cacheMinutes', { label: 'Cache (minutes)', min: 0, max: 60 }),
                PropertyPaneSlider('maxItems', { label: 'Max cards to show', min: 1, max: 24 })
              ]
            },
            {
              groupName: 'Section Titles',
              groupFields: [
                PropertyPaneTextField('sectionTitlePrivileges', {
                  label: 'Privileges tab section title'
                })
              ]
            },
            {
              groupName: 'Breadcrumb',
              groupFields: [
                PropertyPaneTextField('homeUrl', { label: 'Home URL (breadcrumb)', placeholder: '/' })
              ]
            },
            {
              groupName: 'API (if Mode = API)',
              groupFields: [
                PropertyPaneTextField('apiBaseUrl', { label: 'API Base URL' }),
                PropertyPaneTextField('apiMedicalPath', { label: 'Medical path' }),
                PropertyPaneTextField('apiPrivilegesPath', { label: 'Privileges path' })
              ]
            },
            {
              groupName: 'Placeholders (if Mode = Placeholders)',
              groupFields: [
                PropertyPaneTextField('placeholderMedical', { label: 'Medical JSON', multiline: true, rows: 18 }),
                PropertyPaneTextField('placeholderPrivileges', { label: 'Privileges JSON', multiline: true, rows: 18 })
              ]
            }
          ]
        }
      ]
    };
  }
}

/* -------------------- DEFAULT PLACEHOLDERS -------------------- */

// Medical (3 cards + optional promo/banner at bottom)
const DEFAULT_PLACEHOLDER_MEDICAL_JSON = `{
  "banner": { "title": "Offers & Benefits", "subtitle": "Enjoy exclusive perks, rewards, and benefits designed to support you at work and beyond.", "icons": ["crown","shield","heart"] },
  "tabs": [
    { "key": "medical", "text": "Medical Insurance" },
    { "key": "privileges", "text": "Employee Privileges" }
  ],
  "cards": [
    {
      "type": "imageCard",
      "span": 4,
      "title": "Hospital Network",
      "subtitle": "Access a wide network of hospitals where your insurance is accepted for hassle-free care.",
      "imageUrl": "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200",
      "ctaText": "Get the List",
      "ctaUrl": "#"
    },
    {
      "type": "imageCard",
      "span": 4,
      "title": "Table Of Benefits",
      "subtitle": "Enjoy exclusive benefits like discounted rates and faster claims within our partner network.",
      "imageUrl": "https://images.unsplash.com/photo-1601571114074-2758b00c3a54?w=1200",
      "ctaText": "Know More",
      "ctaUrl": "#"
    },
    {
      "type": "infoCard",
      "span": 4,
      "title": "Contact Info",
      "rows": [
        { "label": "Phone", "value": "+1-800-123-4567" },
        { "label": "Email", "value": "almadallahinsuranceportal.com" },
        { "label": "Working Hours", "value": "Mon to Fri • 09:00 AM – 06:00 PM (GMT +4)" }
      ]
    },
    {
      "type": "banner",
      "span": 12,
      "title": "Download <em>Almadallah</em> Insurance Application",
      "bullets": [
        "Allow users to submit and track claims directly through the app.",
        "Provide real-time updates on claim status.",
        "Include an option to upload necessary documents and receipts."
      ],
      "rightImageUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900",
      "badges": [
        { "imageUrl": "https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg", "linkUrl": "#" },
        { "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg", "linkUrl": "#" }
      ],
      "websiteUrl": "https://www.websitelink.ae",
      "websiteText": "www.websitelink.ae"
    }
  ]
}`;

// Employee Privileges (2×2 layout)
const DEFAULT_PLACEHOLDER_PRIV_JSON = `{
  "banner": { "title": "Offers & Benefits", "subtitle": "Enjoy exclusive perks, rewards, and benefits designed to support you at work and beyond.", "icons": ["crown","shield","heart"] },
  "tabs": [
    { "key": "medical", "text": "Medical Insurance" },
    { "key": "privileges", "text": "Employee Privileges" }
  ],
  "cards": [
    {
      "type": "textCard",
      "span": 6,
      "soft": true,
      "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Core_logo_black.svg",
      "title": "Core Direction - Wellness Social Network & Fitness Challenges",
      "accentWords": ["Wellness Social Network & Fitness Challenges"],
      "subtitle": "Core Direction inspires individuals and teams to thrive by connecting wellness, social engagement, and experience — all in one platform. Trusted by global organizations.",
      "ctaText": "www.coredirection.com",
      "ctaUrl": "https://www.coredirection.com"
    },
    {
      "type": "imageCard",
      "span": 6,
      "imageUrl": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1600",
      "title": " "
    },
    {
      "type": "imageCard",
      "span": 6,
      "soft": true,
      "imageUrl": "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=1600",
      "title": "Create Challenges — Stay Motivated"
    },
    {
      "type": "textCard",
      "span": 6,
      "soft": true,
      "title": "The Importance of Staying Fit and Active for Productivity",
      "subtitle": "Physical activity controls weight, strengthens muscles, and lowers disease risk, including heart disease and diabetes. It boosts energy, mood, and mental clarity while reducing stress.",
      "bullets": [
        "Wellness-focused social network",
        "Build a Positive Community",
        "Community engagement platform",
        "Create and share fitness challenges"
      ]
    }
  ]
}`;
