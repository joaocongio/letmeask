import { useHistory, useParams } from "react-router-dom";
import { Fragment } from "react";

import Modal from "react-modal";

import logoImg from "../assets/images/logo.svg";
import deleteImg from "../assets/images/delete.svg";
import checkImg from "../assets/images/check.svg";
import answerImg from "../assets/images/answer.svg";
import deleteQuestion from "../assets/images/DeleteQuestion.svg";

import { Button } from "../components/Button";
import { Question } from "../components/Question";
import { RoomCode } from "../components/RoomCode";
// import { useAuth } from "../hooks/useAuth";
import { useRoom } from "../hooks/useRoom";
import { database } from "../services/firebase";

import "../styles/room.scss";
import { useState } from "react";

type RoomParams = {
  id: string;
};

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    background: "rgba(0,0,0, 0.8)",
  },
};

export function AdminRoom() {
  // const { user } = useAuth();
  const history = useHistory();
  const params = useParams<RoomParams>();
  const roomId = params.id;

  const { title, questions } = useRoom(roomId);

  const [questionIdModalOpen, setQuestionIdModalOpen] = useState<
    string | undefined
  >();
  const [modalEndRoom, setModalEndRoom] = useState(false);

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      endedAt: new Date(),
    });

    history.push("/");
  }

  async function handleDeleteQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
  }

  async function handleCheckQuestionAsAnswered(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isAnswered: true,
    });
  }

  async function handleHighlightQuestion(questionId: string) {
    await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
      isHighlighted: true,
    });
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            <Button isOutlined onClick={() => setModalEndRoom(true)}>
              Encerrar Sala
            </Button>
            <Modal
              isOpen={modalEndRoom}
              style={customStyles}
              onRequestClose={() => setModalEndRoom(false)}
            >
              <div className="modal">
                <img src={deleteQuestion} alt="Ícone encerrar a sala" />
                <h2>Encerrar Sala</h2>
                <p>Tem certeza que deseja encerrar a sala?</p>
                <div className="modal__buttons">
                  <button onClick={() => setModalEndRoom(false)}>Cancelar</button>
                  <button onClick={handleEndRoom}>Sim, encerrar</button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
        </div>

        <div className="question-list">
          {questions.map((question) => {
            return (
              <Fragment key={question.id}>
                <Question
                  key={question.id}
                  content={question.content}
                  author={question.author}
                  isAnswered={question.isAnswered}
                  isHighlighted={question.isHighlighted}
                >
                  {!question.isAnswered && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleCheckQuestionAsAnswered(question.id)
                        }
                      >
                        <img src={checkImg} alt="Marcar pergunta como lida" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHighlightQuestion(question.id)}
                      >
                        <img src={answerImg} alt="Dar destaque à pergunta" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setQuestionIdModalOpen(question.id)}
                  >
                    <img src={deleteImg} alt="Remover pergunra" />
                  </button>
                </Question>

                <Modal
                  isOpen={questionIdModalOpen === question.id}
                  style={customStyles}
                  onRequestClose={() => setQuestionIdModalOpen(undefined)}
                >
                  <div className="modal">
                    <img src={deleteQuestion} alt="Ícone deletar pergunta" />
                    <h2>Deletar pergunta</h2>
                    <p>Tem certeza que você deseja deletar à pergunta??</p>
                    <div className="modal__buttons">
                      <button onClick={() => setQuestionIdModalOpen(undefined)}>
                        Cancelar
                      </button>
                      <button onClick={() => handleDeleteQuestion(question.id)}>
                        Sim, deletar
                      </button>
                    </div>
                  </div>
                </Modal>
              </Fragment>
            );
          })}
        </div>
      </main>
    </div>
  );
}
