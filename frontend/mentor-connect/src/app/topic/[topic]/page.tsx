import TopicDetails from '../../../components/TopicDetails/page';

export default async function TopicPage({
    params,
  }: {
    params: Promise<{ topic: string }>
  }) {
    const topic = (await params).topic; // Access the dynamic route parameter
    console.log("in topic page", topic);
  
    return <TopicDetails topic={topic} />;
  }
  
