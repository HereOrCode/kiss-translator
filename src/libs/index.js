import storage from "./storage";
import {
  DEFAULT_SETTING,
  STOKEY_SETTING,
  STOKEY_RULES,
  STOKEY_FAB,
  GLOBLA_RULE,
  GLOBAL_KEY,
  BUILTIN_RULES,
} from "../config";
import { browser } from "./browser";

/**
 * 获取节点列表并转为数组
 * @param {*} selector
 * @param {*} el
 * @returns
 */
export const queryEls = (selector, el = document) =>
  Array.from(el.querySelectorAll(selector));

/**
 * 查询storage中的设置
 * @returns
 */
export const getSetting = async () => ({
  ...DEFAULT_SETTING,
  ...((await storage.getObj(STOKEY_SETTING)) || {}),
});

/**
 * 查询规则列表
 * @returns
 */
export const getRules = async () => (await storage.getObj(STOKEY_RULES)) || [];

/**
 * 查询fab位置信息
 * @returns
 */
export const getFab = async () => (await storage.getObj(STOKEY_FAB)) || {};

/**
 * 设置fab位置信息
 * @returns
 */
export const setFab = async (obj) => await storage.setObj(STOKEY_FAB, obj);

/**
 * 根据href匹配规则
 * TODO: 支持通配符（*）匹配
 * @param {*} rules
 * @param {string} href
 * @returns
 */
export const matchRule = (rules, href, { injectRules }) => {
  if (injectRules) {
    rules.splice(-1, 0, ...BUILTIN_RULES);
  }

  const rule = rules.find((rule) =>
    rule.pattern.split(",").some((p) => href.includes(p.trim()))
  );
  const globalRule =
    rules.find((rule) =>
      rule.pattern.split(",").some((p) => p.trim() === "*")
    ) || GLOBLA_RULE;

  if (!rule) {
    return globalRule;
  }

  rule.selector =
    rule?.selector?.trim() ||
    globalRule?.selector?.trim() ||
    GLOBLA_RULE.selector;

  rule.bgColor = rule?.bgColor?.trim() || globalRule?.bgColor?.trim();

  ["translator", "fromLang", "toLang", "textStyle", "transOpen"].forEach(
    (key) => {
      if (rule[key] === GLOBAL_KEY) {
        rule[key] = globalRule[key];
      }
    }
  );

  return rule;
};

/**
 * 本地语言识别
 * @param {*} q
 * @returns
 */
export const detectLang = async (q) => {
  const res = await browser?.i18n.detectLanguage(q);
  return res?.languages?.[0]?.language;
};
