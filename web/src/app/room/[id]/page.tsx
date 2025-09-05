interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id: roomId } = await params;
  const query = await searchParams;

  return <div>My Post: {roomId}</div>;
}
