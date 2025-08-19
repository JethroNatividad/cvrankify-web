import React from "react";

type Props = {
  params: { slug: string };
};

const Applicants = ({ params }: Props) => {
  return <div>Applicants {params.slug}</div>;
};

export default Applicants;
