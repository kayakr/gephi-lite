import { FC } from "react";
import { useTranslation } from "react-i18next";

import { GitHubIcon, SingInIcon, SignOutIcon } from "../../components/common-icons";
import { useModal } from "../../core/modals";
import { useConnectedUser } from "../../core/user";
import { useNotifications } from "../../core/notifications";
import { SignInModal } from "../../components/user/SignInModal";
import { LocalSwitcher } from "../../components/LocalSwitcher";

export const GitHubPanel: FC = () => {
  const { openModal } = useModal();
  const { notify } = useNotifications();
  const [user, setUser] = useConnectedUser();
  const { t } = useTranslation("translation");

  return (
    <div>
      <h2 className="fs-4">
        <GitHubIcon className="me-1" /> {t("github.title")}
      </h2>

      <br />

      <LocalSwitcher />

      {!user && (
        <>
          <p className="small">{t("github.description")}</p>
          <button
            className="btn btn-sm btn-outline-dark"
            title={t("auth.sign_in").toString()}
            onClick={() => openModal({ component: SignInModal, arguments: {} })}
          >
            <SingInIcon className="me-1" />
            {t("auth.sign_in")}
          </button>
        </>
      )}
      {user && (
        <>
          <p className="small">{t("github.logged_as", { username: user.name })}</p>
          <button
            className="btn btn-sm btn-outline-dark"
            title={t("auth.sign_out").toString()}
            onClick={() => {
              setUser(null);
              notify({
                type: "success",
                message: t("auth.unauth_success").toString(),
              });
            }}
          >
            <SignOutIcon className="me-1" /> {t("auth.sign_out")}
          </button>
        </>
      )}
    </div>
  );
};
