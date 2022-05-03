import { Container, Button, Paper, Stack } from "@mui/material";
import moment from "moment";
import { useRxCollection, useRxDB } from "rxdb-hooks";
import dynamic from "next/dynamic";
import { COLLECTION_NAMES } from "src/client/db/collectionNames";

const Dropzone = dynamic(() => import("react-dropzone"));

const SettingsPage = () => {
  const db = useRxDB();
  const col = useRxCollection<any>(COLLECTION_NAMES.book);
  const exportDb = async () => {
    if (db && col) {
      const json = await db.exportJSON();
      // col.importJSON(json);
      const uInt8 = new TextEncoder().encode(JSON.stringify(json));
      const streamSaver = await import("streamsaver");
      const filename = `${moment().utc(false).format("yyyy_MM_DD_hh_mm_ss")}__${
        json.name
      }-${json.instanceToken}.json`;
      const fileStream = streamSaver.createWriteStream(filename);
      const writer = fileStream.getWriter();
      writer.write(uInt8);
      writer.close();
    }
  };

  const importDb = async (file: File) => {
    if (db) {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = async () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result as ArrayBuffer;
        const decoder = new TextDecoder();
        const str = decoder.decode(binaryStr);
        const json = JSON.parse(str);
        await db.importJSON(json);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper>
        <Stack>
          <Button onClick={exportDb}>
            匯出離線資料(搜尋記錄,近期閱讀,書本資訊,書本內容)
          </Button>
          <Dropzone
            onDrop={(acceptedFiles) => importDb(acceptedFiles[0])}
            multiple={false}
            accept={{ "application/json": [] }}
          >
            {({ getRootProps, getInputProps }) => (
              <Paper
                elevation={2}
                sx={{ width: 250, height: 200 }}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <Button>匯入離線資料,支援檔案直接拖放</Button>
              </Paper>
            )}
          </Dropzone>
        </Stack>
      </Paper>
    </Container>
  );
};

export default SettingsPage;
