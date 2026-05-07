import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy – MesterPlan",
};

const sections = [
    {
        title: "What information does the Application obtain and how is it used?",
        body: "The Application acquires the information you supply when you download and register the Application. Registration with the Service Provider is not mandatory. However, bear in mind that you might not be able to utilize some of the features offered by the Application unless you register with them.\n\nThe Service Provider may also use the information you provided them to contact you from time to time to provide you with important information, required notices and marketing promotions.",
    },
    {
        title: "What information does the Application collect automatically?",
        body: "In addition, the Application may collect certain information automatically, including, but not limited to, the type of mobile device you use, your mobile device's unique device ID, the IP address of your mobile device, your mobile operating system, the type of mobile Internet browsers you use, and information about the way you use the Application.",
    },
    {
        title: "Does the Application collect precise real time location information of the device?",
        body: "This Application does not gather precise information about the location of your mobile device.",
    },
    {
        title: "Does the Application use Artificial Intelligence (AI) technologies?",
        body: "The Application does not use Artificial Intelligence (AI) technologies to process your data or provide features.",
    },
    {
        title: "Do third parties see and/or have access to information obtained by the Application?",
        body: "Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service.\n\nThe Application utilizes third-party services that have their own Privacy Policy about handling data, including Expo.\n\nThe Service Provider may disclose User Provided and Automatically Collected Information: as required by law, such as to comply with a subpoena or similar legal process; when they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request; or with their trusted service providers who work on their behalf, do not have an independent use of the information disclosed to them, and have agreed to adhere to the rules set forth in this privacy statement.",
    },
    {
        title: "What are my opt-out rights?",
        body: "You can halt all collection of information by the Application easily by uninstalling the Application. You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network.",
    },
    {
        title: "Data retention policy and managing your information",
        body: "The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter. Automatically Collected information is retained for up to 24 months and may thereafter be stored in aggregate.\n\nIf you'd like the Service Provider to delete User Provided Data that you have provided via the Application, please contact them at henrikandreassen.ha@gmail.com and we will respond in a reasonable time. Please note that some or all of the User Provided Data may be required in order for the Application to function properly.",
    },
    {
        title: "Children's privacy",
        body: "The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13. The Application does not address anyone under the age of 13.\n\nIn the case the Service Provider discovers that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider at henrikandreassen.ha@gmail.com so that the necessary actions can be taken.",
    },
    {
        title: "Security",
        body: "The Service Provider is concerned about safeguarding the confidentiality of your information. Physical, electronic, and procedural safeguards are provided to protect information we process and maintain. Access to this information is limited to authorized employees and contractors who need to know that information in order to operate, develop or improve the Application.\n\nPlease be aware that, although we endeavour to provide reasonable security for information we process and maintain, no security system can prevent all potential security breaches.",
    },
    {
        title: "Changes to this Privacy Policy",
        body: "This Privacy Policy may be updated from time to time for any reason. The Service Provider will notify you of any changes by updating this page with the new Privacy Policy. You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes.",
    },
    {
        title: "Your consent",
        body: "By using the Application, you are giving your consent to the Service Provider processing of your information as set forth in this Privacy Policy now and as amended by us. \"Processing\" means using cookies on a computer/hand held device or using or touching information in any way, including, but not limited to, collecting, storing, deleting, using, combining and disclosing information.",
    },
    {
        title: "Contact us",
        body: "If you have any questions regarding privacy while using the Application, or have questions about our practices, please contact the Service Provider via email at henrikandreassen.ha@gmail.com.",
    },
];

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#F9F9F8] px-4 py-16">
            <div className="max-w-2xl mx-auto">
                <div className="mb-10">
                    <p className="text-sm text-[#6B7280] mb-2">MesterPlan · Andreassen A/S</p>
                    <h1 className="text-3xl font-semibold text-[#111827] mb-3">Privacy Policy</h1>
                    <p className="text-sm text-[#6B7280]">Effective date: 2026-05-06</p>
                </div>

                <div className="space-y-8 text-[#374151]">
                    <p className="text-sm leading-relaxed">
                        This privacy policy is applicable to the MesterPlan app for mobile devices, developed by Andreassen A/S as a commercial service. This service is provided "AS IS".
                    </p>

                    {sections.map((section, i) => (
                        <section key={i}>
                            <h2 className="text-base font-semibold text-[#111827] mb-3">{section.title}</h2>
                            {section.body.split("\n\n").map((para, j) => (
                                <p key={j} className="text-sm leading-relaxed mb-3 last:mb-0">{para}</p>
                            ))}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
