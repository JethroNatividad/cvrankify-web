import React from "react";

type Props = {
  params: { slug: string };
};

const Edit = ({ params }: Props) => {
  return <div>Edit {params.slug}</div>;
};

export default Edit;
