const styles = {
    container: {
        marginTop: "80px",
        display: "flex",
        flexDirection: "column",
    },
    header: {
        backgroundColor: "#FF0000",
        color: "white",
        textAlign: "center",
        padding: "20px 0",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    headerLeft: {
        position: "absolute",
        left: "20px",
        top: "50%",
        transform: "translateY(-50%)",
    },
    headerTitle: {
        fontSize: "24px",
        margin: 0,
    },
    mainContainer: {
        flex: 3,
        textAlign: "center",
        marginBottom: "500px",
    },
    title: {
        marginBottom: "20px",
    },
    searchContainer: {
        marginBottom: "20px",
    },
    searchBar: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "20px",
        gap: "10px",
        width: "100%",
        maxWidth: "200px",
        margin: "0 auto",
        transform: "translateX(20px)",
        position: "relative",
    },
    input: {
        flex: 1,
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "8px",
        borderRadius: "5px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        whiteSpace: "nowrap",
    },
    removeButton: {
        padding: "8px",
        borderRadius: "5px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        cursor: "pointer",
        fontSize: "14px",
        whiteSpace: "nowrap",
    },
    resultsContainer: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "15px",
    },
    pokemonCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
        minWidth: "200px",
        wordWrap: "break-word",
        textAlign: "center",
    },
    pokemonName: {
        fontSize: "14px",
        lineHeight: "1.5",
        margin: "10px 0",
    },
    partyContainer: {
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        backgroundColor: "white",
        borderTop: "1px solid #ccc",
        padding: "8px",
        display: "flex",
        justifyContent: "center",
        zIndex: 1000,
    },
    partyGrid: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "8px",
    },
    partyCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "8px",
        width: "150px",
        textAlign: "center",
    },
    partyImage: {
        width: "60px",
        height: "60px",
    },
    pokemonImage: {
        width: "250px",
        height: "250px",
    },
    suggestionList: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "5px",
        zIndex: 1000,
        listStyle: "none",
        padding: "0",
        margin: "0",
        maxHeight: "200px",
        overflowY: "auto",
    },
    suggestionItem: {
        padding: "10px",
        cursor: "pointer",
        borderBottom: "1px solid #ccc",
    },
    modalBackdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
    },
    modal: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "15px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        maxWidth: "500px",
        width: "90%",
        textAlign: "center",
        animation: "fadeIn 0.8s ease",
    },
    modalTitle: {
        fontSize: "18px",
        marginBottom: "10px",
    },
    scrollableMovesContainer: {
        maxHeight: "1000px",
        padding: "10px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "5px",
        marginBottom: "10px",
    },
    paginationControls: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "10px",
    },
    paginationButton: {
        padding: "5px 10px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "3px",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },
    paginationButtonDisabled: {
        backgroundColor: "#ccc",
        cursor: "not-allowed",
    },

    moveList: {
        listStyleType: "none", // デフォルトのリストスタイルを解除
        margin: 0,
        padding: 0,
    },
    moveItem: {
        padding: "10px",
        marginBottom: "5px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        cursor: "pointer",
        textAlign: "center",
        transition: "background-color 0.2s",
    },
    moveButton: {
        width: "100%", // ボタン幅を100%
        padding: "8px",
        textAlign: "center",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "3px",
        cursor: "pointer",
        transition: "background-color 0.2s",
    },

    moveButtonHover: {
        backgroundColor: "#45a049", // ホバー時の背景色
    },

    closeButton: {
        marginTop: "10px",
        padding: "10px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    confirmButton: {
        marginTop: "10px",
        padding: "10px",
        fontSize: "14px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    partyTitle: {
        position: "fixed",
        left: "0",
        textAlign: "center",
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "10px",
        color: "#333",
    },
    shareButtonContainer: {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
    },
    shareButton: {
        padding: "10px 20px",
        backgroundColor: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "16px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s",
    },
    selectionContainer: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
    },
    moveSelection: {
        flex: 1,
        marginRight: "20px",
    },
    itemSelection: {
        flex: 1,
    },
    itemDropdown: {
        width: "100%",
        padding: "10px",
        fontSize: "14px",
        borderRadius: "4px",
        border: "1px solid #ccc",
    },

    modalActions: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "10px",
    },
    moveRow: {
        display: "flex",
        alignItems: "center", // 垂直方向の中央揃え
        gap: "8px", // アイテム間のスペース
        justifyContent: "start", // 左揃え
    },
    moveTypeImageContainer: {
        flexShrink: 0, // 画像のサイズを固定
    },
    moveTypeImage: {
        borderRadius: "50%", // 必要なら丸くする
        border: "1px solid #ccc", // 必要なら枠線を追加
    },
    moveInfo: {
        fontWeight: "bold",
        color: "#333",
        textAlign: "left",
        margin: "0", // 改行を防ぐためにマージンをリセット
        whiteSpace: "nowrap", // テキストの折り返しを防止
    },



};

export default styles;
