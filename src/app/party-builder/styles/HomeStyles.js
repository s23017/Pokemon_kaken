const styles = {
    container: {
        paddingTop: "80px",
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
        paddingBottom: "500px",
    },
    title: {
        paddingBottom: "20px",
    },
    searchContainer: {
        paddingBottom: "20px",
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
        border: "10px solid #black",
        borderRadius: "5px",
        padding: "10px",
        minWidth: "200px",
        wordWrap: "break-word",
        textAlign: "center",
        backgroundColor:"white",
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
        backgroundColor: "rgba(255, 255, 255, 0.5)", // 透明度50%の白
        borderTop: "1px solid #ccc",

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
        padding: "10px",
        width: "200px",
        textAlign: "center",
    },
    partyImage: {
        width: "100px",
        height: "100px",
        marginBottom: "10px", // 技リストとの間隔
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
        width: "90%",
        height: "90%",
        textAlign: "center",
        animation: "fadeIn 0.8s ease",
        overflow: "auto", // スクロールを有効にする

    },
    modalTitle: {
        fontSize: "18px",
        marginBottom: "10px",
    },
    scrollableMovesContainer: {
        maxHeight: "1000px",
        height: "560px",
        padding: "10px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "5px",
        marginBottom: "10px",
    },
    paginationButtonDisabled: {
        backgroundColor: "#ccc",
        cursor: "not-allowed",
    },

    moveList: {
        listStyleType: "none",
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
        width: "100%",
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
        backgroundColor: "#45a049",
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
        alignItems: "center",
        gap: "8px",
        justifyContent: "start",
    },
    moveTypeImageContainer: {
        flexShrink: 0,
    },
    moveTypeImage: {
        borderRadius: "50%",
        border: "1px solid #ccc",
    },
    moveInfo: {
        fontWeight: "bold",
        color: "#333",
        textAlign: "left",
        margin: "0",
        whiteSpace: "nowrap",
    },

    modalSubtitle: {
        fontSize: "16px",
        marginBottom: "10px",
    },

    modalContent: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    movesContainer: {
        flex: 1,
        maxWidth: "33%",
        padding: "10px",
        border: "2px solid #ddd",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        margin: "0 10px",
    },
    itemsContainer: {
        height: "630px",

        flex: 1,
        maxWidth: "33%",
        padding: "10px",
        border: "2px solid #ddd",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        margin: "0 10px",
    },

    itemsList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "center",
    },
    itemCard: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "120px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        boxSizing: "border-box",
    },
    itemImage: {
        width: "40px",
        height: "40px",
    },
    terastalImage: {
        width: "40px",
        height: "40px",
    },
    itemName: {
        fontSize: "14px",
        textAlign: "center",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        width: "100%",
    },
    paginationControls: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
    paginationInfo: {
        margin: "0 10px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#333",
    },
    selectedInfoContainer: {
        marginTop: "20px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px",
        backgroundColor: "#f9f9f9",
    },
    selectedInfoRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "20px",
    },
    selectedColumn: {
        flex: 1,
        textAlign: "center",
    },
    selectedMove: {
        fontSize: "14px",
        color: "#333",
        margin: "2px 0",
        listStyleType: "none", // リストスタイルを非表示にする
    },
    additionalInfo: {
        display: "flex",
        flexDirection: "column", // 持ち物とテラスタルを縦方向に配置
        alignItems: "center",
        gap: "10px", // 各アイテム間の間隔
    },
    imageAndDetailsContainer: {
        display: "flex",
        alignItems: "center", // ポケモン画像と持ち物・テラスタルを中央揃え
        justifyContent: "center",
    },
    itemAndTerastalContainer: {
        display: "flex",
        flexDirection: "column", // 縦に並べる
        alignItems: "center",
        width: "fit-content", // コンテンツの幅に合わせる
        height: "fit-content", // コンテンツの高さに合わせる
    },
    columnContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
    },
    abilitiesContainer: {
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "5px",
    },
    naturesContainer: {
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "5px",
    },
    effortValuesContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "5px",
    },
    effortValueRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
    },
    effortValueLabel: {
        flex: "1",
        fontWeight: "bold",
    },
    effortValueInput: {
        width: "60px", // 入力欄の幅
        padding: "5px",
        textAlign: "center",
    },
    rowContainer: {
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        justifyContent: "space-between",
        width: "100%",
    },
    selectionBox: {
        border: "1px solid #ddd",
        padding: "10px",
        borderRadius: "5px",
        flex: "1",
    },
    selectionTitle: {
        fontWeight: "bold",
        marginBottom: "10px",
    },
    selectionContent: {
        maxHeight: "200px",
        overflowY: "auto",
    },
    toggleIcon: {

    },


};

export default styles;
