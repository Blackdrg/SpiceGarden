export declare class LegalController {
    getPrivacyPolicy(): {
        title: string;
        effectiveDate: string;
        lastUpdated: string;
        sections: {
            id: string;
            title: string;
            content: string;
        }[];
        contact: string;
    };
    getTermsOfService(): {
        title: string;
        effectiveDate: string;
        lastUpdated: string;
        sections: {
            id: string;
            title: string;
            content: string;
        }[];
        contact: string;
    };
    getIntellectualProperty(): {
        title: string;
        copyright: string;
        license: string;
        ownedAssets: string[];
        thirdPartyLicenses: {
            name: string;
            license: string;
            compatible: boolean;
        }[];
    };
}
