import React, { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import Upload from "../upload/Upload";
import { Image } from "@imagekit/react";
import { ai, safetySettings } from "../../lib/gemini";
import Markdown from "react-markdown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import { authedFetch } from "../../lib/api";

function NewPrompt({ data }) {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState("");
  const [ans, setAnswer] = useState("");
  const [img, setImg] = useState({
    isLoading: false,
    error: "",
    dbData: {},
    aiData: {},
  });

  const endRef = useRef(null);
  const formRef = useRef(null);

  const queryClient = useQueryClient();

  const [isGenerating, setIsGenerating] = useState(false);

  const chat = React.useMemo(() => {
    const history = (data?.history ?? []).flatMap(({ role, parts } = {}) => {
      // Gemini requires each history item to have a valid role.
      if (role !== "user" && role !== "model") return [];
      const text = parts?.[0]?.text;
      if (!text) return [];
      return [{ role, parts: [{ text }] }];
    });

    return ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: {
        safetySettings,
      },
      history,
      generationConfig: {
        // maxOutputTokens: 100,
      },
    });
  }, [data?.history]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data, question, ans, img.dbData]);

  const mutation = useMutation({
    mutationFn: ({ question: q, ans: aText }) => {
      return authedFetch(`/api/chats/${data._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: q?.length ? q : undefined,
            ans: aText,
            img: img.dbData?.filePath || undefined,
          }),
        },
        getToken
      ).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          formRef.current.reset();
          setQuestion("");
          setAnswer("");
          setImg({
            isLoading: false,
            error: "",
            dbData: {},
            aiData: {},
          });
        });
    },
    onError: (err) => {
      console.log(err);
    },
  });

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);
    try {
      setIsGenerating(true);

      const response = await chat.sendMessageStream({
        message: Object.entries(img.aiData).length
          ? [img.aiData, text]
          : [text],
      });

      let accumulatedText = "";
      for await (const chunk of response) {
        const chunkText = chunk.text;
        accumulatedText += chunkText;
        setAnswer(accumulatedText);
      }

      // Avoid race condition by passing the final streamed text directly
      mutation.mutate({ question: text, ans: accumulatedText });
    } catch (err) {
      console.log(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGenerating) return;

    const text = e.target.text.value;
    if (!text) return;

    add(text, false);
  };
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      const first = data?.history?.[0];
      const initialText = first?.parts?.[0]?.text;

      if (data?.history?.length === 1 && initialText) {
        add(initialText, true);
      }
    }
    hasRun.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/*ADD NEW CHAT*/}
      {img.isLoading && <div className="">Loading...</div>}
      {img.dbData?.filePath && (
        <Image
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_ENDPOINT}
          src={img.dbData?.url} //src={img.dbData?.url}
          width="380"
          transformation={[{ width: 380 }]}
        />
      )}
      {question && <div className="message user">{question}</div>}
      {ans && (
        <div className="message">
          <Markdown>{ans}</Markdown>
        </div>
      )}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <Upload setImg={setImg} getToken={getToken} />
        <input id="file" type="file" multiple={false} hidden />
        <input type="text" name="text" placeholder="Ask anything..." />
        <button>
          <img src="/arrow.png" alt="" />
        </button>
      </form>
    </>
  );
}

export default NewPrompt;
