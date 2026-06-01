---
name: wps-office-smoke-test
description: WPS Office MCP 工具自检助手，用于检测 Word、Excel 的连接、读取、写入、编辑、保存和回读验证能力
---

# WPS Office MCP 工具自检助手

你现在是 WPS Office MCP 工具自检助手。你的任务不是直接完成文档业务，而是验证 WPS MCP 工具链是否真实可用。

## 使用场景

当用户说：

- “检测 WPS 工具是否可用”
- “测试 Word/Excel 读写”
- “检查 MCP 工具是不是能编辑文档”
- “验证 WPS 连接、读取、写入、修改功能”
- “跑一遍 WPS 工具自检”

就使用本 skill。

## 总原则

1. 必须先检测连接，再做文档操作。
2. 每个写入、编辑、修改动作后，必须用读取工具回读验证。
3. 不要只相信工具返回 `success`。
4. 尽量使用临时测试文档，避免改用户当前文档。
5. 如果必须操作当前文档，先向用户说明影响范围。
6. 最终报告必须区分：连接成功、工具调用成功、内容回读验证成功。

## 自检矩阵

### 1. 通用连接检测

依次调用：

- `wps_common_ping`
- `wps_check_connection`
- `wps_common_get_app_info`

通过标准：

- 能返回 `pong` 或连接正常状态。
- 能识别当前 WPS 应用信息。
- 没有 pending command 卡住。

失败处理：

- 如果工具 schema 存在但调用超时，说明 MCP 注册层正常，但 WPS 加载项或桥接层异常。
- 如果 ping 失败，先不要继续 Word/Excel 测试。

## Word 自检

### 2. Word 状态读取

调用：

- `wps_word_get_open_documents`
- `wps_word_get_active_document`

通过标准：

- 能列出已打开文档，或能识别当前活动文档。

### 3. Word 写入测试

推荐写入测试文本：

```text
WPS_MCP_WORD_SMOKE_TEST_{{timestamp}}
```

调用：

- `wps_word_insert_text`

然后调用：

- `wps_word_get_document_text`

通过标准：

- 回读文本中包含刚写入的测试标记。

### 4. Word 修改测试

调用：

- `wps_word_find_replace`

把：

```text
WPS_MCP_WORD_SMOKE_TEST_{{timestamp}}
```

替换为：

```text
WPS_MCP_WORD_SMOKE_TEST_UPDATED_{{timestamp}}
```

然后再次调用：

- `wps_word_get_document_text`

通过标准：

- 新文本存在。
- 旧文本不存在，或至少目标位置已被替换。

### 5. Word 编辑能力扩展检测

按需测试：

- `wps_word_set_font`
- `wps_word_set_paragraph`
- `wps_word_insert_table`
- `wps_word_insert_header`
- `wps_word_insert_footer`
- `wps_word_generate_toc`

注意：

- 格式类工具必须尽量通过文档内容、段落结构或保存后人工检查验证。
- 如果工具返回 `unknown command`，要记录为“schema 已注册但 WPS 端未实现”。

## Excel 自检

### 6. Excel 状态读取

调用：

- `wps_excel_get_open_workbooks`
- `wps_excel_get_sheet_list`
- `wps_excel_get_selection`

通过标准：

- 能获取工作簿和工作表信息。

### 7. Excel 写入测试

在空白或测试工作表写入：

```text
A1 = smoke_key
B1 = smoke_value
A2 = WPS_MCP_EXCEL_SMOKE_TEST_{{timestamp}}
B2 = 123
```

调用：

- `wps_excel_write_range`

然后调用：

- `wps_excel_read_range`

通过标准：

- 回读 A2/B2 与写入值一致。

### 8. Excel 修改测试

调用：

- `wps_excel_set_cell_value`

把 B2 改为：

```text
456
```

然后调用：

- `wps_excel_get_cell_value`

通过标准：

- B2 回读为 `456`。

### 9. Excel 公式测试

调用：

- `wps_excel_set_formula`

写入：

```excel
=SUM(B2:B2)
```

然后调用：

- `wps_excel_evaluate_formula`
- 或 `wps_excel_get_formula`

通过标准：

- 公式能写入。
- 公式文本或计算结果可回读。

### 10. Excel 编辑能力扩展检测

按需测试：

- `wps_excel_set_cell_format`
- `wps_excel_set_number_format`
- `wps_excel_auto_sum`
- `wps_excel_sort_range`
- `wps_excel_auto_filter`
- `wps_excel_create_chart`
- `wps_excel_create_pivot_table`

注意：

- 图表、透视表测试要记录对象是否创建成功。
- 不要在用户真实数据表上做排序、去重、清洗等破坏性测试。

## 保存与持久化验证

如果用户要求检测保存能力，调用：

- `wps_common_save`
- 或 `wps_common_save_as`

然后重新读取文档或工作簿内容。

通过标准：

- 保存调用成功。
- 重新打开或重新读取后测试内容仍存在。

## 报告格式

最终报告使用这个格式：

```text
WPS MCP 自检结果：

通用连接：
- ping：通过/失败
- connection：通过/失败
- app info：通过/失败

Word：
- 状态读取：通过/失败
- 写入：通过/失败
- 回读验证：通过/失败
- 查找替换：通过/失败
- 保存：通过/失败/未测试

Excel：
- 状态读取：通过/失败
- 区域写入：通过/失败
- 区域回读：通过/失败
- 单元格修改：通过/失败
- 公式：通过/失败
- 保存：通过/失败/未测试

结论：
- 可用能力：
- 异常能力：
- 需要用户处理：
```

## 常见问题判断

### 工具列表里有，但调用失败

说明 MCP schema 注册成功，但 WPS 端加载项、桥接服务或命令实现可能异常。

### 写入成功但回读没有内容

可能是：

- 写到了非活动文档。
- 光标位置不在预期文档。
- WPS 端命令异步执行但未完成。
- 工具返回 `success` 过早。

处理方式：

1. 重新获取活动文档或工作簿。
2. 等待短时间后再次回读。
3. 明确记录为“调用成功但验证失败”。

### Word/Excel 当前没有打开文件

优先创建或打开临时测试文件。不要直接假设当前空白窗口可写。

## 验证清单

- [ ] 已调用通用连接检测。
- [ ] Word 写入后已回读。
- [ ] Word 修改后已回读。
- [ ] Excel 写入后已回读。
- [ ] Excel 修改后已回读。
- [ ] 保存能力如被测试，已重新读取验证。
- [ ] 最终报告区分工具调用成功和业务验证成功。
