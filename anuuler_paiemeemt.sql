CREATE OR REPLACE PACKAGE BODY pkg_crd_garantie AS

  -- Vérifie si le paiement a été envoyé à la compta
  FUNCTION est_envoye_compta(p_claim_benefit_seq NUMBER) RETURN BOOLEAN IS
    v_status VARCHAR2(1);
  BEGIN
    SELECT NVL(ANNULER_PMT, '0')
    INTO v_status
    FROM COMPTA_CLAIM_PMT
    WHERE CLAIM_BENEFIT_SEQ = p_claim_benefit_seq;

    RETURN v_status = '0'; -- Non annulé, donc envoyé
  EXCEPTION
    WHEN NO_DATA_FOUND THEN
      RETURN FALSE;
  END;

  -- Recalculer les garanties si possible
  PROCEDURE recalculer_garantie(p_claim_benefit_seq IN NUMBER) IS
  BEGIN
    IF est_envoye_compta(p_claim_benefit_seq) THEN
      RAISE_APPLICATION_ERROR(-20001, 'Paiement déjà envoyé à la comptabilité. Veuillez l''annuler pour continuer.');
    END IF;

    -- Supprimer les anciennes données liées
    DELETE FROM CLAIM_CASH_BENEFIT WHERE CLAIM_BENEFIT_SEQ = p_claim_benefit_seq;
    DELETE FROM CLAIM_DECISION WHERE CLAIM_BENEFIT_SEQ = p_claim_benefit_seq;
    DELETE FROM COMPTA_CLAIM_PMT WHERE CLAIM_BENEFIT_SEQ = p_claim_benefit_seq;

    -- Appel au calcul existant (à adapter)
    CALCUL_GARANTIE_EXISTANTE(p_claim_benefit_seq); -- Remplacer par la vraie procédure

  END;

  -- Annuler un paiement
  PROCEDURE annuler_paiement(p_claim_benefit_seq IN NUMBER, p_user IN VARCHAR2, p_date IN TIMESTAMP) IS
  BEGIN
    UPDATE CLAIM_CASH_BENEFIT
    SET ANNULER_PMT = '1',
        ANNULER_DATE = p_date,
        ANNULER_USER = p_user
    WHERE CLAIM_BENEFIT_SEQ = p_claim_benefit_seq;

    UPDATE CLAIM_OUTBOUND_DOCUMENT_MEDIA
    SET ANNULER_PMT = '1',
        ANNULER_DATE = p_date,
        ANNULER_USER = p_user
    WHERE OUTBOUND_DOCUMENT_SEQ IN (81, 82)
      AND CLAIM_BENEFIT_SEQ = p_claim_benefit_seq;

    UPDATE CLAIM_BENEFIT_BENEFICIARY
    SET ANNULER_DIST = '1',
        DATE_ANNULE = p_date,
        ANNULER_USER = p_user
    WHERE CLAIM_BENEFIT_SEQ = p_claim_benefit_seq;
  END;

  -- Mise à jour post-annulation (statuts, logs, etc.)
  PROCEDURE maj_status_apres_annulation(p_claim_benefit_seq IN NUMBER, p_user IN VARCHAR2, p_date IN TIMESTAMP) IS
  BEGIN
    UPDATE COMPTA_CLAIM_PMT
    SET ANNULER_PMT = '1',
        ANNULER_DATE = p_date,
        ANNULER_USER = p_user
    WHERE CLAIM_BENEFIT_SEQ = p_claim_benefit_seq;
  END;

END pkg_crd_garantie;
