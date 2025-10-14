import { COURSE_BLUEPRINT } from '@workspace/ui/data/academy/course-blueprint';
import { ClassAssignmentDataLayer } from '@/components/dataLayer/academy/ClassAssignmentDataLayer';
import { CreatePathwayClassDataLayer } from '@/components/dataLayer/academy/CreatePathwayClassDataLayer';

type PageProps = {
  params: { id: string };
};

export default function CreatePathwayClassPage({ params }: PageProps) {
  const pathway = COURSE_BLUEPRINT.find((group) => group.id === params.id);

  if (pathway) {
    return <CreatePathwayClassDataLayer pathway={pathway} />;
  }

  return <ClassAssignmentDataLayer classId={params.id} />;
}
