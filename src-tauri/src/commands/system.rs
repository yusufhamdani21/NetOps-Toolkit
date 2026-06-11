use serde::Serialize;
use tauri::command;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportPdfResult {
    pub success: bool,
    pub path: Option<String>,
    pub error: Option<String>,
}

#[command]
pub async fn export_pdf(_html: String, _filename: String) -> ExportPdfResult {
    ExportPdfResult {
        success: false,
        path: None,
        error: Some("PDF export not available in this build. Use TXT or JSON export instead.".to_string()),
    }
}
