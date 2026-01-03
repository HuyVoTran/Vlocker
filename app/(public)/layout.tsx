import PublicPagesLayout from "@/components/layout/PublicPagesLayout";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
        <PublicPagesLayout>
            {children}
        </PublicPagesLayout>
    );
}