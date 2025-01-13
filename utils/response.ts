type responseType = {
  data?: any;
  isError?: boolean;
  message?: string;
};

export const response = ({
  data = null,
  isError = false,
  message = "Something went wrong.Please try again.",
}: responseType) => {
  return {
    data,
    isError,
    message: isError ? message : "Success",
  };
};
