import React, { ReactNode, SetStateAction, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [error, setError] =
    useState<SetStateAction<ReactNode | string | null>>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    if (file) {
      const authorizationToken = localStorage.getItem("authorization_token");

      // Get the presigned URL
      const response = await axios({
        method: "GET",
        ...(authorizationToken && {
          headers: {
            authorization: `Basic ${authorizationToken}`,
          },
        }),
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
      }).catch((e) => {
        console.log(e);
        setError(`${e.response.data.message} - ${e.response.status}`);
      });

      if (response) {
        console.log("File to upload: ", file.name);
        console.log("Uploading to: ", response.data.url);

        const result = await fetch(response.data.url, {
          method: "PUT",
          body: file,
        }).then(() => {
          setError(null);
        });

        console.log("Result: ", result);
        removeFile();
      }
    }
  };
  return (
    <Box>
      {error && <Alert severity="error">{`${error}`}</Alert>}
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button
            onClick={() => {
              removeFile();
              setError(null);
            }}
          >
            Remove file
          </button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
