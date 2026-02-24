export default function PlaceholderPage({ params }: { params: { slug: string } }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground">
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p>This feature is being cooked.</p>
        </div>
    );
}
