import NewsletterIsland from "./NewsletterIsland"; // importing a client component is fine


export function renderNewsletter(className: string, label?: string) {
    return (
            <NewsletterIsland className={className} label={label} />
    )
}