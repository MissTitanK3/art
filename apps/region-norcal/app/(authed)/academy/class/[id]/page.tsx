import { COURSE_BLUEPRINT } from '@workspace/ui/data/academy/course-blueprint';
import { ClassAssignmentDataLayer } from '@/components/dataLayer/academy/ClassAssignmentDataLayer';
import { CreatePathwayClassDataLayer } from '@/components/dataLayer/academy/CreatePathwayClassDataLayer';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CreatePathwayClassPage({ params }: PageProps) {
  const { id } = await params;
  const pathway = COURSE_BLUEPRINT.find((group) => group.id === id);

  if (pathway) {
    return <CreatePathwayClassDataLayer pathway={pathway} />;
  }

  return <ClassAssignmentDataLayer classId={id} />;
}
